const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const Plan = require('../models/planModel');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
const { resolveTierSpecs } = require('../utils/tierSpecs');
const {
  PAYOUT_INTERVAL_DAYS,
  PAYOUT_PERCENT,
  countPayouts,
} = require('../utils/miningPayout');

exports.getPlans = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === 'true') filter.isActive = true;
  if (req.query.search) {
    filter.name = { $regex: String(req.query.search).trim(), $options: 'i' };
  }

  const plans = await Plan.find(filter).sort('price');

  const normalizedPlans = await Promise.all(
    plans.map(async (plan) => {
      const specs = resolveTierSpecs(plan.price, plan);
      const isMismatch =
        plan.modelName !== specs.modelName ||
        plan.deviceCount !== specs.deviceCount ||
        plan.dailyIncome !== specs.dailyIncome ||
        plan.scooterIncome !== specs.scooterIncome ||
        plan.vipTier !== specs.vipTier;

      if (isMismatch) {
        await Plan.updateOne(
          { _id: plan._id },
          {
            $set: {
              modelName: specs.modelName,
              deviceCount: specs.deviceCount,
              dailyIncome: specs.dailyIncome,
              scooterIncome: specs.scooterIncome,
              vipTier: specs.vipTier,
              vehicleType: `Electric Scooter ${specs.modelName}`,
            },
          }
        ).catch(() => {});
      }

      const planObj = plan.toObject();
      return {
        ...planObj,
        modelName: specs.modelName,
        deviceCount: specs.deviceCount,
        dailyIncome: specs.dailyIncome,
        scooterIncome: specs.scooterIncome,
        vipTier: specs.vipTier,
      };
    })
  );

  res.status(200).json({ results: normalizedPlans.length, data: normalizedPlans });
});

exports.getPlan = asyncHandler(async (req, res, next) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return next(new ApiError(`No plan for this id ${req.params.id}`, 404));

  const specs = resolveTierSpecs(plan.price, plan);
  const planObj = plan.toObject();
  const normalized = {
    ...planObj,
    modelName: specs.modelName,
    deviceCount: specs.deviceCount,
    dailyIncome: specs.dailyIncome,
    scooterIncome: specs.scooterIncome,
    vipTier: specs.vipTier,
  };

  res.status(200).json({ data: normalized });
});

exports.createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json({ data: plan });
});

exports.updatePlan = asyncHandler(async (req, res, next) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return next(new ApiError(`No plan for this id ${req.params.id}`, 404));
  res.status(200).json({ data: plan });
});

exports.deletePlan = asyncHandler(async (req, res, next) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);
  if (!plan) return next(new ApiError(`No plan for this id ${req.params.id}`, 404));
  res.status(204).send();
});

exports.subscribeToPlan = asyncHandler(async (req, res, next) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan || !plan.isActive) {
    return next(new ApiError('Plan is not found or inactive', 404));
  }

  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  // Check available balance minus pending withdrawals
  const pendingTxs = await WalletTransaction.find({
    user: user._id,
    type: 'withdraw',
    status: 'pending',
  }).select('amount');
  const pendingWithdrawalTotal = pendingTxs.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0
  );
  const availableBalance = (user.walletBalance || 0) - pendingWithdrawalTotal;

  if (availableBalance < plan.price) {
    return next(
      new ApiError(
        pendingWithdrawalTotal > 0
          ? `الرصيد المتاح غير كافٍ للاشتراك بالباقة (توجد طلبات سحب معلقة بقيمة $${pendingWithdrawalTotal.toFixed(2)})`
          : 'Insufficient wallet balance to subscribe',
        400
      )
    );
  }

  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = Number((balanceBefore - plan.price).toFixed(2));
  user.walletBalance = balanceAfter;

  const subscribedAt = new Date();
  const expiresAt = new Date(subscribedAt);
  expiresAt.setDate(expiresAt.getDate() + (plan.durationDays || 30));

  const subscriptionEntry = {
    plan: plan._id,
    planName: plan.name,
    price: plan.price,
    subscribedAt,
    expiresAt,
    status: 'active',
  };
  user.planSubscriptions = user.planSubscriptions || [];
  user.planSubscriptions.push(subscriptionEntry);

  // Plan Stacking / Upgrade Logic:
  // Calculate total active fleet investment across all active subscriptions
  const activeSubs = user.planSubscriptions.filter((s) => s.status === 'active');
  const totalSubPrice = activeSubs.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const newTotalPrice = Math.max(plan.price, totalSubPrice);

  const fleetSpecs = resolveTierSpecs(newTotalPrice);
  const existingScooter = user.activeScooters && user.activeScooters[0];

  user.activeScooters = [
    {
      plan: plan._id,
      modelName: fleetSpecs.modelName,
      deviceCount: fleetSpecs.deviceCount,
      scooterIncome: 2.5,
      dailyIncome: fleetSpecs.dailyIncome,
      price: newTotalPrice,
      status: existingScooter ? existingScooter.status : 'OPEN',
      countdownEndsAt: existingScooter ? existingScooter.countdownEndsAt : null,
      runSecondsToday: existingScooter ? (existingScooter.runSecondsToday || 0) : 0,
      lastStartedAt: existingScooter ? existingScooter.lastStartedAt : null,
      lastClaimDate: existingScooter ? existingScooter.lastClaimDate : '',
      pendingIncome: fleetSpecs.dailyIncome,
      totalCollected: existingScooter ? (existingScooter.totalCollected || 0) : 0,
      purchasedAt: existingScooter?.purchasedAt || subscribedAt,
    },
  ];

  user.currentPlan = {
    plan: plan._id,
    planName: fleetSpecs.modelName,
    price: newTotalPrice,
    subscribedAt,
    expiresAt,
    status: 'active',
  };
  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'plan_purchase',
    status: 'completed',
    amount: plan.price,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `استثمار وترقية أسطول السكوتر: ${plan.name} (${plan.price} USDT) | إجمالي الأسطول: ${newTotalPrice} USDT`,
    createdBy: req.user._id,
  });

  res.status(200).json({
    status: 'Success',
    message: `تم تفعيل وتحديث أسطولك بنجاح! إجمالي الأسطول: ${newTotalPrice} USDT بدخل يومي ${fleetSpecs.dailyIncome} USDT`,
    data: {
      walletBalance: user.walletBalance,
      currentPlan: user.currentPlan,
      planSubscriptions: user.planSubscriptions,
      activeScooter: user.activeScooters[0],
      plan,
    },
  });
});

exports.getMySubscriptions = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    'walletBalance currentPlan planSubscriptions'
  );

  if (!user) return next(new ApiError('User not found', 404));

  res.status(200).json({
    status: 'Success',
    data: {
      walletBalance: user.walletBalance || 0,
      currentPlan: user.currentPlan,
      planSubscriptions: user.planSubscriptions || [],
    },
  });
});

exports.getAdminPlansManagement = asyncHandler(async (req, res) => {
  const search = req.query.search ? String(req.query.search).trim() : '';
  const status = req.query.status ? String(req.query.status).toLowerCase() : 'all';

  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const plans = await Plan.find(filter).sort('price');
  const users = await User.find({}).select('planSubscriptions').lean();

  const nowTs = Date.now();
  const planStats = {};

  for (let i = 0; i < plans.length; i += 1) {
    const p = plans[i];
    planStats[String(p._id)] = {
      totalSubscribers: 0,
      activeSubscribers: 0,
    };
  }

  for (let i = 0; i < users.length; i += 1) {
    const subs = users[i].planSubscriptions || [];
    for (let j = 0; j < subs.length; j += 1) {
      const s = subs[j];
      if (s && s.plan) {
        const key = String(s.plan);
        if (planStats[key]) {
          planStats[key].totalSubscribers += 1;
          if (
            s.status === 'active' &&
            s.expiresAt &&
            new Date(s.expiresAt).getTime() > nowTs
          ) {
            planStats[key].activeSubscribers += 1;
          }
        }
      }
    }
  }

  const data = plans.map((p) => {
    const stats = planStats[String(p._id)] || {
      totalSubscribers: 0,
      activeSubscribers: 0,
    };
    const dailyRatePercent = PAYOUT_PERCENT / PAYOUT_INTERVAL_DAYS;
    const totalReturnPercent = PAYOUT_PERCENT * countPayouts(p.durationDays);

    return {
      planId: p._id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      durationDays: p.durationDays,
      dailyRatePercent,
      totalReturnPercent,
      payoutPercent: PAYOUT_PERCENT,
      payoutIntervalDays: PAYOUT_INTERVAL_DAYS,
      hashrate: p.hashrate,
      hashrateUnit: p.hashrateUnit,
      roiMinPercent: p.roiMinPercent,
      roiMaxPercent: p.roiMaxPercent,
      isActive: p.isActive,
      isPopular: p.isPopular,
      features: p.features || [],
      totalSubscribers: stats.totalSubscribers,
      activeSubscribers: stats.activeSubscribers,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  const totalPlans = data.length;
  const totalSubscribers = data.reduce((acc, item) => acc + item.totalSubscribers, 0);
  const totalActiveSubscribers = data.reduce(
    (acc, item) => acc + item.activeSubscribers,
    0
  );

  res.status(200).json({
    status: 'Success',
    summary: {
      totalPlans,
      totalSubscribers,
      totalActiveSubscribers,
    },
    results: data.length,
    data,
  });
});
