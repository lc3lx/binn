const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const WalletTransaction = require('../models/walletTransactionModel');
const { resolveTierSpecs, TASK_DURATION_SECONDS } = require('../utils/tierSpecs');

const DURATION_SECONDS = TASK_DURATION_SECONDS || 18000; // 5 hours = 18000 seconds

/**
 * Returns current UTC date string YYYY-MM-DD
 */
const getTodayUtcString = () => new Date().toISOString().slice(0, 10);

/**
 * Formats seconds into HH:MM:SS string
 */
const formatSecondsToHHMMSS = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = String(Math.floor(s / 3600)).padStart(2, '0');
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const secs = String(s % 60).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
};

/**
 * Format date like DD-MM-YYYY HH:mm:ss
 */
const formatDateTime = (d) => {
  const date = d ? new Date(d) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const mins = pad(date.getMinutes());
  const secs = pad(date.getSeconds());
  return `${day}-${month}-${year} ${hours}:${mins}:${secs}`;
};

/**
 * Calculate active scooter runtime state
 */
const getScooterRunState = (scooter) => {
  let runSecs = scooter.runSecondsToday || 0;
  if (scooter.status === 'PROGRESS' && scooter.lastStartedAt) {
    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(scooter.lastStartedAt).getTime()) / 1000));
    runSecs = Math.min(DURATION_SECONDS, runSecs + elapsed);
  }

  const remaining = Math.max(0, DURATION_SECONDS - runSecs);
  const isCompleted = remaining === 0;
  let status = scooter.status || 'OPEN';

  if (isCompleted) {
    status = 'COMPLETED';
  } else if (status === 'COMPLETED') {
    status = 'OPEN';
  }

  return {
    runSeconds: runSecs,
    remainingSeconds: remaining,
    isCompleted,
    status,
    countdown: formatSecondsToHHMMSS(remaining),
  };
};

/**
 * Helper to ensure user has scooter representation & plan stacking consolidation
 */
const ensureUserScooter = async (user) => {
  let modified = false;

  if (!user.numericId) {
    user.numericId = Math.floor(1000 + Math.random() * 9000);
    modified = true;
  }

  const todayStr = getTodayUtcString();
  if (user.lastTaskDate !== todayStr) {
    user.todayTasksCompleted = 0;
    user.todayScooterIncome = 0;
    user.lastTaskDate = todayStr;
    modified = true;

    if (user.activeScooters && user.activeScooters.length > 0) {
      user.activeScooters.forEach((sc) => {
        sc.runSecondsToday = 0;
        sc.lastStartedAt = null;
        sc.countdownEndsAt = null;
        sc.status = 'OPEN';
        sc.lastClaimDate = '';
      });
    }
  }

  // Plan Stacking / Consolidation:
  // Calculate total fleet price from active subscriptions or existing active scooters
  const activeSubs = (user.planSubscriptions || []).filter((s) => s.status === 'active');
  let effectiveFleetPrice = 0;

  if (activeSubs.length > 0) {
    effectiveFleetPrice = activeSubs.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  } else if (user.activeScooters && user.activeScooters.length > 0) {
    effectiveFleetPrice = user.activeScooters.reduce((sum, sc) => sum + (Number(sc.price) || 0), 0);
  }

  if (effectiveFleetPrice <= 0) {
    effectiveFleetPrice = 50; // default entry tier
  }

  const fleetSpecs = resolveTierSpecs(effectiveFleetPrice);
  const primary = (user.activeScooters && user.activeScooters[0]) || {};

  // Check if consolidation or update is needed
  const needsConsolidation =
    !user.activeScooters ||
    user.activeScooters.length !== 1 ||
    primary.price !== effectiveFleetPrice ||
    primary.dailyIncome !== fleetSpecs.dailyIncome ||
    primary.deviceCount !== fleetSpecs.deviceCount;

  if (needsConsolidation) {
    user.activeScooters = [
      {
        plan: primary.plan || null,
        modelName: fleetSpecs.modelName,
        deviceCount: fleetSpecs.deviceCount,
        scooterIncome: 2.5,
        dailyIncome: fleetSpecs.dailyIncome,
        price: effectiveFleetPrice,
        status: primary.status || 'OPEN',
        countdownEndsAt: primary.countdownEndsAt,
        runSecondsToday: primary.runSecondsToday || 0,
        lastStartedAt: primary.lastStartedAt,
        lastClaimDate: primary.lastClaimDate || '',
        pendingIncome: fleetSpecs.dailyIncome,
        totalCollected: primary.totalCollected || 0,
        purchasedAt: primary.purchasedAt || new Date(),
      },
    ];

    user.currentPlan = {
      planName: fleetSpecs.modelName,
      price: effectiveFleetPrice,
      status: 'active',
    };
    modified = true;
  }

  if (modified) {
    await user.save();
  }
};

/**
 * @desc    Get today's ride tasks status and VIP quota
 * @route   GET /api/v1/tasks/today-status
 * @access  Private/User
 */
exports.getTodayTaskStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  await ensureUserScooter(user);

  const todayStr = getTodayUtcString();
  const maskedAccount = user.phone
    ? `***${user.phone.slice(-4)}`
    : user.email
    ? `***${user.email.split('@')[0].slice(-4)}`
    : '***9742';

  const primaryScooter = user.activeScooters[0];
  const runState = getScooterRunState(primaryScooter);

  // If run finished while on screen, persist status COMPLETED
  if (runState.isCompleted && primaryScooter.status !== 'COMPLETED') {
    primaryScooter.status = 'COMPLETED';
    primaryScooter.runSecondsToday = DURATION_SECONDS;
    primaryScooter.countdownEndsAt = null;
    primaryScooter.lastStartedAt = null;
    await user.save();
  }

  const claimedToday = primaryScooter.lastClaimDate === todayStr || user.todayTasksCompleted > 0;
  const currentStatus = claimedToday ? 'CLAIMED' : runState.status;

  const scooters = [
    {
      id: primaryScooter._id,
      modelName: primaryScooter.modelName,
      deviceCount: primaryScooter.deviceCount,
      countdown: claimedToday ? '00:00:00' : runState.countdown,
      remainingSeconds: claimedToday ? 0 : runState.remainingSeconds,
      runSecondsToday: runState.runSeconds,
      dailyIncome: primaryScooter.dailyIncome,
      scooterIncome: 2.5,
      status: currentStatus,
      price: primaryScooter.price,
      purchasedAt: formatDateTime(primaryScooter.purchasedAt),
      currentIncome: claimedToday ? primaryScooter.dailyIncome : 0,
      image: '/scooter_transparent.png',
      isCompleted: runState.isCompleted,
      claimedToday,
      canCollect: !claimedToday && runState.isCompleted,
      canPowerOn: !claimedToday && !runState.isCompleted && currentStatus !== 'PROGRESS',
      canPowerOff: currentStatus === 'PROGRESS',
      taskDurationSeconds: DURATION_SECONDS,
    },
  ];

  res.status(200).json({
    status: 'Success',
    data: {
      userId: user.numericId || 1649,
      maskedAccount,
      activeTier: primaryScooter.modelName,
      activeStatus: currentStatus === 'PROGRESS' ? 'قيد الرحلة' : claimedToday ? 'مكتمل ومستلم' : 'بنشاط',
      progress: Math.min(100, Math.round((runState.runSeconds / DURATION_SECONDS) * 100)),
      totalIncome: user.totalTaskEarnings || 0,
      availableToClaim: !claimedToday && runState.isCompleted ? primaryScooter.dailyIncome : 0,
      todayIncome: user.todayScooterIncome || 0,
      walletBalance: user.walletBalance || 0,
      activeScooters: scooters,
      completedScooters: [],
      serverDate: todayStr,
      hasActiveVehicle: true,
      vehicleName: `ETG Scooter ${primaryScooter.modelName}`,
      vipTier: Math.min(7, Math.max(1, Math.round(primaryScooter.price / 50))),
      totalTasks: 1,
      tasksCompleted: user.todayTasksCompleted || (claimedToday ? 1 : 0),
      tasksRemaining: claimedToday ? 0 : 1,
      dailyIncome: primaryScooter.dailyIncome,
      totalTaskEarnings: user.totalTaskEarnings || 0,
      claimedToday,
      canCollect: !claimedToday && runState.isCompleted,
      countdown: claimedToday ? '00:00:00' : runState.countdown,
      remainingSeconds: claimedToday ? 0 : runState.remainingSeconds,
      taskDurationHours: 5,
    },
  });
});

/**
 * @desc    Power on scooter (starts 5-hour task or pauses it with tracking)
 * @route   POST /api/v1/tasks/power-on
 * @access  Private/User
 */
exports.powerOnScooter = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  await ensureUserScooter(user);

  const todayStr = getTodayUtcString();
  const targetScooter = user.activeScooters[0];

  if (!targetScooter) {
    return next(new ApiError('لا يوجد سكوتر متاح للتشغيل', 400));
  }

  if (targetScooter.lastClaimDate === todayStr || user.todayTasksCompleted > 0) {
    return next(
      new ApiError('لقد أتممت مهمة اليوم واستلمت أرباحك بنجاح! تبدأ المهمة القادمة غداً عند منتصف الليل UTC.', 400)
    );
  }

  // Toggle state
  if (targetScooter.status === 'PROGRESS') {
    // Turning OFF (Pausing)
    const elapsed = targetScooter.lastStartedAt
      ? Math.max(0, Math.floor((Date.now() - new Date(targetScooter.lastStartedAt).getTime()) / 1000))
      : 0;

    targetScooter.runSecondsToday = Math.min(
      DURATION_SECONDS,
      (targetScooter.runSecondsToday || 0) + elapsed
    );
    targetScooter.lastStartedAt = null;
    targetScooter.countdownEndsAt = null;

    const remaining = Math.max(0, DURATION_SECONDS - targetScooter.runSecondsToday);
    if (remaining === 0) {
      targetScooter.status = 'COMPLETED';
    } else {
      targetScooter.status = 'OPEN';
    }

    await user.save();

    return res.status(200).json({
      status: 'Success',
      message:
        remaining === 0
          ? 'اكتملت مهمة الـ 5 ساعات بنجاح! يمكنك الآن جمع أرباح اليوم بالضغط على زر ($).'
          : `تم إيقاف تشغيل السكوتر مؤقتاً. متبقي ${formatSecondsToHHMMSS(remaining)} لإكمال الـ 5 ساعات واستحقاق الأرباح.`,
      data: {
        status: targetScooter.status,
        remainingSeconds: remaining,
        countdown: formatSecondsToHHMMSS(remaining),
        canCollect: targetScooter.status === 'COMPLETED',
      },
    });
  }

  // Turning ON
  const runState = getScooterRunState(targetScooter);
  if (runState.isCompleted) {
    targetScooter.status = 'COMPLETED';
    await user.save();
    return res.status(200).json({
      status: 'Success',
      message: 'تم إكمال مهمة الـ 5 ساعات لهذا اليوم بالفعل! يمكنك الآن الضغط على زر ($) لجمع الأرباح.',
      data: {
        status: 'COMPLETED',
        remainingSeconds: 0,
        countdown: '00:00:00',
        canCollect: true,
      },
    });
  }

  // Start running
  const remaining = runState.remainingSeconds;
  targetScooter.status = 'PROGRESS';
  targetScooter.lastStartedAt = new Date();
  targetScooter.countdownEndsAt = new Date(Date.now() + remaining * 1000);

  await user.save();

  res.status(200).json({
    status: 'Success',
    message: 'تم تشغيل السكوتر بنجاح! بدأ احتساب مدة الرحلة اليومية (5 ساعات للحصول على الأرباح).',
    data: {
      status: 'PROGRESS',
      remainingSeconds: remaining,
      countdown: formatSecondsToHHMMSS(remaining),
      canCollect: false,
    },
  });
});

/**
 * @desc    Collect earnings for a specific scooter (maroon $ button)
 * @route   POST /api/v1/tasks/collect
 * @access  Private/User
 */
exports.collectScooterEarnings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  await ensureUserScooter(user);

  const todayStr = getTodayUtcString();
  const targetScooter = user.activeScooters[0];

  if (!targetScooter) {
    return next(new ApiError('لم يتم العثور على سكوتر نشط لجمع الأرباح', 400));
  }

  if (targetScooter.lastClaimDate === todayStr || user.todayTasksCompleted > 0) {
    return next(
      new ApiError('لقد قمت بجمع أرباح اليوم بالفعل! المهمة اليومية التالية ستكون متاحة غداً.', 400)
    );
  }

  // Verify that the scooter has fully completed 5 hours
  const runState = getScooterRunState(targetScooter);
  if (!runState.isCompleted) {
    return next(
      new ApiError(
        `لا يمكن جمع الأرباح حتى تكتمل مهمة التشغيل (5 ساعات كاملة). الوقت المتبقي: ${runState.countdown}`,
        400
      )
    );
  }

  // Exact 5% daily return of the consolidated fleet
  const rewardAmount = Number(targetScooter.dailyIncome.toFixed(2));
  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = Number((balanceBefore + rewardAmount).toFixed(2));

  user.walletBalance = balanceAfter;
  user.todayTasksCompleted = 1;
  user.todayScooterIncome = rewardAmount;
  user.totalTaskEarnings = Number(((user.totalTaskEarnings || 0) + rewardAmount).toFixed(2));
  user.pendingScooterIncome = 0;

  targetScooter.totalCollected = Number(
    ((targetScooter.totalCollected || 0) + rewardAmount).toFixed(2)
  );
  targetScooter.status = 'COMPLETED';
  targetScooter.lastClaimDate = todayStr;
  targetScooter.runSecondsToday = DURATION_SECONDS;
  targetScooter.lastStartedAt = null;
  targetScooter.countdownEndsAt = null;

  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'ride_task_profit',
    status: 'completed',
    amount: rewardAmount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `استلام أرباح مهمة الـ 5 ساعات لسكوتر ${targetScooter.modelName} (إجمالي الأسطول: ${targetScooter.price} USDT)`,
    createdBy: user._id,
  });

  res.status(200).json({
    status: 'Success',
    message: `تهانينا! تم إكمال مهمة الـ 5 ساعات بنجاح وجمع ${rewardAmount} USDT وإيداعها في رصيدك!`,
    data: {
      rewardAmount,
      walletBalance: balanceAfter,
      todayIncome: user.todayScooterIncome,
      totalIncome: user.totalTaskEarnings,
      availableToClaim: 0,
      claimedToday: true,
      status: 'COMPLETED',
    },
  });
});

/**
 * @desc    Collect all earnings from all scooters ("جمع في نقرة واحدة")
 * @route   POST /api/v1/tasks/collect-all
 * @access  Private/User
 */
exports.collectAllScooters = exports.collectScooterEarnings;

/**
 * @desc    Backward compatible complete-ride task
 * @route   POST /api/v1/tasks/complete-ride
 * @access  Private/User
 */
exports.completeRideTask = exports.collectScooterEarnings;
