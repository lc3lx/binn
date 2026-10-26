const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const WalletTransaction = require('../models/walletTransactionModel');

/**
 * Returns current UTC date string YYYY-MM-DD
 */
const getTodayUtcString = () => new Date().toISOString().slice(0, 10);

/**
 * Format date like screenshot: DD-MM-YYYY HH:mm:ss
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
 * Helper to ensure user has scooter representation
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
  }

  // If user has no active scooters, provide the primary scooter (default E2)
  if (!user.activeScooters || user.activeScooters.length === 0) {
    const e2Plan = await Plan.findOne({ modelName: 'E2' });
    const now = new Date();
    user.activeScooters = [
      {
        plan: e2Plan ? e2Plan._id : null,
        modelName: 'E2',
        deviceCount: 2,
        scooterIncome: 2.5,
        dailyIncome: 5.0,
        price: 100,
        status: 'OPEN',
        countdownEndsAt: new Date(Date.now() + 5 * 3600 * 1000),
        lastClaimDate: '',
        pendingIncome: 5.0,
        totalCollected: 5.0,
        purchasedAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000),
      },
    ];
    user.pendingScooterIncome = 5.0;
    user.todayScooterIncome = 5.0;
    user.totalTaskEarnings = (user.totalTaskEarnings || 0) + 5.0;
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

  const scooters = (user.activeScooters || []).map((scooter) => {
    let remainingSeconds = 0;
    let countdownStr = '00:00:00';

    if (scooter.status === 'PROGRESS' && scooter.countdownEndsAt) {
      const diff = Math.max(0, Math.floor((new Date(scooter.countdownEndsAt) - new Date()) / 1000));
      remainingSeconds = diff;
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      countdownStr = `${h}:${m}:${s}`;
    } else if (scooter.status === 'PROGRESS') {
      countdownStr = '04:59:50';
    }

    const calculatedDaily = scooter.dailyIncome || (scooter.price ? Number((scooter.price * 0.05).toFixed(2)) : 5.0);
    const calculatedDevices = scooter.deviceCount || (scooter.price ? Math.max(1, Math.round(scooter.price / 50)) : 2);

    return {
      id: scooter._id,
      modelName: scooter.modelName || 'E2',
      deviceCount: calculatedDevices,
      countdown: countdownStr,
      remainingSeconds,
      dailyIncome: calculatedDaily,
      scooterIncome: scooter.scooterIncome || 2.5,
      status: scooter.status || 'OPEN',
      price: scooter.price || 100,
      purchasedAt: formatDateTime(scooter.purchasedAt),
      currentIncome: scooter.pendingIncome || 0,
      image: '/scooter_transparent.png',
    };
  });

  const activeScooter = scooters[0] || {
    modelName: 'E2',
    deviceCount: 2,
    dailyIncome: 5.0,
    scooterIncome: 2.5,
    status: 'OPEN',
    price: 100,
  };

  res.status(200).json({
    status: 'Success',
    data: {
      userId: user.numericId || 1649,
      maskedAccount,
      activeTier: activeScooter.modelName || 'E2',
      activeStatus: 'بنشاط',
      progress: 72,
      totalIncome: user.totalTaskEarnings || 5.0,
      availableToClaim: user.pendingScooterIncome ?? 5.0,
      todayIncome: user.todayScooterIncome ?? 5.0,
      walletBalance: user.walletBalance || 0,
      activeScooters: scooters,
      completedScooters: [],
      serverDate: todayStr,
      hasActiveVehicle: true,
      vehicleName: `ETG Scooter ${activeScooter.modelName}`,
      vipTier: 2,
      totalTasks: 2,
      tasksCompleted: user.todayTasksCompleted || 0,
      tasksRemaining: Math.max(0, 2 - (user.todayTasksCompleted || 0)),
      dailyIncome: activeScooter.dailyIncome || 5.0,
      totalTaskEarnings: user.totalTaskEarnings || 5.0,
    },
  });
});

/**
 * @desc    Power on scooter (turns status to PROGRESS and starts countdown)
 * @route   POST /api/v1/tasks/power-on
 * @access  Private/User
 */
exports.powerOnScooter = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  await ensureUserScooter(user);

  const { scooterId } = req.body;
  let targetScooter = null;

  if (scooterId && user.activeScooters) {
    targetScooter = user.activeScooters.id(scooterId);
  }
  if (!targetScooter && user.activeScooters && user.activeScooters.length > 0) {
    targetScooter = user.activeScooters[0];
  }

  if (!targetScooter) {
    return next(new ApiError('No scooter available to start', 400));
  }

  // Toggle or start
  if (targetScooter.status === 'PROGRESS') {
    // If already in progress, toggle off or inform
    targetScooter.status = 'OPEN';
  } else {
    targetScooter.status = 'PROGRESS';
    // 5 hours countdown
    targetScooter.countdownEndsAt = new Date(Date.now() + 5 * 3600 * 1000);
  }

  await user.save();

  res.status(200).json({
    status: 'Success',
    message:
      targetScooter.status === 'PROGRESS'
        ? 'تم تشغيل السكوتر بنجاح! بدأ العد التنازلي للرحلة.'
        : 'تم إيقاف تشغيل السكوتر.',
    data: {
      status: targetScooter.status,
      countdown: targetScooter.status === 'PROGRESS' ? '04:59:59' : '00:00:00',
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

  const { scooterId } = req.body;
  let targetScooter = null;

  if (scooterId && user.activeScooters) {
    targetScooter = user.activeScooters.id(scooterId);
  }
  if (!targetScooter && user.activeScooters && user.activeScooters.length > 0) {
    targetScooter = user.activeScooters[0];
  }

  if (!targetScooter) {
    return next(new ApiError('No scooter found to collect earnings', 400));
  }

  const rewardAmount =
    targetScooter.dailyIncome ||
    (targetScooter.price ? Number((targetScooter.price * 0.05).toFixed(2)) : 5.0);
  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = Number((balanceBefore + rewardAmount).toFixed(2));

  user.walletBalance = balanceAfter;
  user.todayTasksCompleted = (user.todayTasksCompleted || 0) + 1;
  user.todayScooterIncome = Number(((user.todayScooterIncome || 0) + rewardAmount).toFixed(2));
  user.totalTaskEarnings = Number(((user.totalTaskEarnings || 0) + rewardAmount).toFixed(2));
  user.pendingScooterIncome = 0;

  targetScooter.totalCollected = Number(
    ((targetScooter.totalCollected || 0) + rewardAmount).toFixed(2)
  );
  targetScooter.status = 'OPEN';

  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'ride_task_profit',
    status: 'completed',
    amount: rewardAmount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `جمع دخل سكوتر ${targetScooter.modelName} (${targetScooter.deviceCount} أجهزة)`,
    createdBy: user._id,
  });

  res.status(200).json({
    status: 'Success',
    message: `تم جمع ${rewardAmount} USDT بنجاح وإيداعها في رصيدك!`,
    data: {
      rewardAmount,
      walletBalance: balanceAfter,
      todayIncome: user.todayScooterIncome,
      totalIncome: user.totalTaskEarnings,
      availableToClaim: 0,
    },
  });
});

/**
 * @desc    Collect all earnings from all scooters ("جمع في نقرة واحدة")
 * @route   POST /api/v1/tasks/collect-all
 * @access  Private/User
 */
exports.collectAllScooters = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  await ensureUserScooter(user);

  let totalReward = 0;
  if (user.activeScooters && user.activeScooters.length > 0) {
    user.activeScooters.forEach((sc) => {
      totalReward += sc.dailyIncome || (sc.price ? Number((sc.price * 0.05).toFixed(2)) : 5.0);
      sc.status = 'OPEN';
    });
  } else {
    totalReward = 5.0;
  }

  totalReward = Number(totalReward.toFixed(2));
  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = Number((balanceBefore + totalReward).toFixed(2));

  user.walletBalance = balanceAfter;
  user.todayTasksCompleted = (user.todayTasksCompleted || 0) + 1;
  user.todayScooterIncome = Number(((user.todayScooterIncome || 0) + totalReward).toFixed(2));
  user.totalTaskEarnings = Number(((user.totalTaskEarnings || 0) + totalReward).toFixed(2));
  user.pendingScooterIncome = 0;

  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'ride_task_profit',
    status: 'completed',
    amount: totalReward,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `جمع في نقرة واحدة لجميع السكوترات النشطة`,
    createdBy: user._id,
  });

  res.status(200).json({
    status: 'Success',
    message: `تم جمع كافة أرباح السكوترات (${totalReward} USDT) بنجاح!`,
    data: {
      rewardAmount: totalReward,
      walletBalance: balanceAfter,
      todayIncome: user.todayScooterIncome,
      totalIncome: user.totalTaskEarnings,
      availableToClaim: 0,
    },
  });
});

/**
 * @desc    Backward compatible complete-ride task
 * @route   POST /api/v1/tasks/complete-ride
 * @access  Private/User
 */
exports.completeRideTask = exports.collectScooterEarnings;
