const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
const Plan = require('../models/planModel');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const clampDays = (days) => {
  const parsed = Number(days);
  if (Number.isNaN(parsed)) return 14;
  if (parsed < 1) return 1;
  if (parsed > 90) return 90;
  return parsed;
};

const getActiveSubscriptions = (user) => {
  const now = Date.now();
  const subs = user.planSubscriptions || [];
  return subs
    .filter((s) => {
      if (!s) return false;
      if (s.status !== 'active') return false;
      if (!s.expiresAt) return false;
      return s.expiresAt.getTime() > now;
    })
    .map((s) => {
      // Populate may attach the plan doc on `s.plan`
      return s;
    });
};

const computeEstimatedPnLFromPlan = (plan, investedAmount) => {
  // In our plan schema we store ROI min/max as "percent" per month.
  const roiMin = Number(plan.roiMinPercent || 0);
  const roiMax = Number(plan.roiMaxPercent || 0);
  const roiAvg = (roiMin + roiMax) / 2;

  const monthlyDividends = (investedAmount * roiAvg) / 100;
  // Convert to daily using 30-day month approximation.
  const dailyDividends = monthlyDividends / 30;

  return { roiAvgPercent: roiAvg, dailyDividends, monthlyDividends };
};

exports.getDashboardSummary = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    'walletBalance planSubscriptions currentPlan'
  );
  if (!user) return next(new ApiError('User not found', 404));

  // Populate plan details for each subscription, so we can compute hashrate/ROI.
  await user.populate('planSubscriptions.plan');

  const activeSubs = getActiveSubscriptions(user);
  const now = new Date();

  let totalHashrate = 0;
  let estimatedMonthlyDividends = 0;
  let estimatedDailyPnL = 0;
  let earliestExpiry = null;
  let latestExpiry = null;

  const activePlansDetailed = activeSubs
    .map((s) => {
      const plan = s.plan;
      if (!plan) return null;

      const investedAmount = Number(plan.price) || 0;
      const pnl = computeEstimatedPnLFromPlan(plan, investedAmount);

      const hashrate = Number(plan.hashrate) || 0;
      totalHashrate += hashrate;
      estimatedMonthlyDividends += pnl.monthlyDividends;
      estimatedDailyPnL += pnl.dailyDividends;

      if (s.expiresAt) {
        const t = s.expiresAt.getTime();
        if (!earliestExpiry || t < earliestExpiry.getTime())
          earliestExpiry = new Date(t);
        if (!latestExpiry || t > latestExpiry.getTime())
          latestExpiry = new Date(t);
      }

      return {
        subscriptionId: s._id,
        planId: plan._id,
        planName: plan.name,
        hashrate,
        hashrateUnit: plan.hashrateUnit,
        roiMinPercent: plan.roiMinPercent,
        roiMaxPercent: plan.roiMaxPercent,
        durationDays: plan.durationDays,
        estimatedMonthlyDividends: pnl.monthlyDividends,
        estimatedDailyPnL: pnl.dailyDividends,
        subscribedAt: s.subscribedAt,
        expiresAt: s.expiresAt,
      };
    })
    .filter(Boolean);

  const remainingDaysMin = earliestExpiry
    ? Math.max(0, Math.ceil((earliestExpiry.getTime() - now.getTime()) / MS_PER_DAY))
    : 0;
  const remainingDaysMax = latestExpiry
    ? Math.max(0, Math.ceil((latestExpiry.getTime() - now.getTime()) / MS_PER_DAY))
    : 0;

  // Realized mining profit from wallet transactions (optional, if you create mining_profit records)
  const nowStart = new Date(now);
  nowStart.setHours(0, 0, 0, 0);

  const realizedToday = await WalletTransaction.aggregate([
    {
      $match: {
        user: user._id,
        type: 'mining_profit',
        status: { $in: ['completed', 'paid'] },
        createdAt: { $gte: nowStart },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const realizedTodayPnL = realizedToday && realizedToday.length ? realizedToday[0].total : 0;

  res.status(200).json({
    status: 'Success',
    data: {
      currency: 'USD',
      walletBalance: user.walletBalance || 0,

      totals: {
        totalHashrate,
        estimatedDailyPnL,
        estimatedMonthlyDividends,
        remainingDaysMin,
        remainingDaysMax,
        realizedTodayPnL,
        activePlansCount: activePlansDetailed.length,
      },

      activePlans: activePlansDetailed,
    },
  });
});

exports.getRecentActivity = asyncHandler(async (req, res, next) => {
  const limit = clampDays(req.query.limit); // re-use clamp for reasonable size

  const transactions = await WalletTransaction.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(limit)
    .populate('createdBy', 'name email role');

  const mapped = transactions.map((t) => {
    let label = 'Completed';
    if (t.type === 'withdraw' && t.status !== 'paid') {
      if (t.status === 'pending') label = 'Pending Review';
      else if (t.status === 'approved') label = 'Approved';
      else if (t.status === 'rejected') label = 'Rejected';
      else label = t.status;
    }

    if (t.type === 'deposit') label = 'Deposit';
    if (t.type === 'mining_profit') label = 'Mining Profit';
    if (t.type === 'plan_purchase') label = 'Plan Purchase';
    if (t.type === 'referral_commission') label = 'Referral Commission';

    return {
      transactionId: t._id,
      type: t.type,
      status: t.status,
      label,
      amount: t.amount,
      currency: t.currency,
      note: t.note,
      createdAt: t.createdAt,
      createdBy: t.createdBy || null,
    };
  });

  res.status(200).json({
    status: 'Success',
    results: mapped.length,
    data: mapped,
  });
});

exports.getHashrateSeries = asyncHandler(async (req, res, next) => {
  const days = clampDays(req.query.days);
  const user = await User.findById(req.user._id).select('planSubscriptions');
  if (!user) return next(new ApiError('User not found', 404));
  await user.populate('planSubscriptions.plan');

  const now = new Date();
  const start = new Date(now.getTime() - days * MS_PER_DAY);

  const points = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(start.getTime() + i * MS_PER_DAY);
    const t = day.getTime();

    let total = 0;
    const subs = user.planSubscriptions || [];
    for (let j = 0; j < subs.length; j += 1) {
      const s = subs[j];
      if (!s || s.status !== 'active') continue;
      if (!s.plan) continue;
      if (!s.subscribedAt || !s.expiresAt) continue;

      const startT = s.subscribedAt.getTime();
      const endT = s.expiresAt.getTime();
      if (t >= startT && t < endT) {
        total += Number(s.plan.hashrate) || 0;
      }
    }

    points.push({
      date: day.toISOString().slice(0, 10),
      hashrateTotal: total,
    });
  }

  res.status(200).json({
    status: 'Success',
    data: {
      currency: 'TH/s',
      points,
    },
  });
});

exports.getAllocation = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    'planSubscriptions walletBalance'
  );
  if (!user) return next(new ApiError('User not found', 404));
  await user.populate('planSubscriptions.plan');

  const activeSubs = getActiveSubscriptions(user);
  const byPlan = {};

  for (let i = 0; i < activeSubs.length; i += 1) {
    const s = activeSubs[i];
    if (!s || !s.plan) continue;

    const key = String(s.plan._id);
    if (!byPlan[key]) {
      byPlan[key] = {
        planId: s.plan._id,
        planName: s.plan.name,
        hashrate: 0,
        hashrateUnit: s.plan.hashrateUnit,
      };
    }
    byPlan[key].hashrate += Number(s.plan.hashrate) || 0;
  }

  const allocation = Object.values(byPlan);

  res.status(200).json({
    status: 'Success',
    data: {
      walletBalance: user.walletBalance || 0,
      allocation,
    },
  });
});

