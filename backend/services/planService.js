const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const Plan = require('../models/planModel');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
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
  res.status(200).json({ results: plans.length, data: plans });
});

exports.getPlan = asyncHandler(async (req, res, next) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return next(new ApiError(`No plan for this id ${req.params.id}`, 404));
  res.status(200).json({ data: plan });
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

  const balanceBefore = user.walletBalance || 0;
  if (balanceBefore < plan.price) {
    return next(new ApiError('Insufficient wallet balance to subscribe', 400));
  }

  const balanceAfter = balanceBefore - plan.price;
  user.walletBalance = balanceAfter;

  const subscribedAt = new Date();
  const expiresAt = new Date(subscribedAt);
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

  const subscriptionEntry = {
    plan: plan._id,
    planName: plan.name,
    subscribedAt,
    expiresAt,
    status: 'active',
  };
  user.planSubscriptions = user.planSubscriptions || [];
  user.planSubscriptions.push(subscriptionEntry);

  // Backward compatibility: keep currentPlan as the most recently created subscription
  user.currentPlan = subscriptionEntry;
  await user.save();

  await WalletTransaction.create({
    user: user._id,
    type: 'plan_purchase',
    status: 'completed',
    amount: plan.price,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `Plan subscription: ${plan.name}`,
    createdBy: req.user._id,
  });

  res.status(200).json({
    status: 'Success',
    message: 'Plan subscribed successfully',
    data: {
      walletBalance: user.walletBalance,
      currentPlan: user.currentPlan,
      planSubscriptions: user.planSubscriptions,
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
