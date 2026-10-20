const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
const SupportTicket = require('../models/supportTicketModel');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const percentChange = (current, previous) => {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev <= 0) {
    if (curr > 0) return 100;
    return 0;
  }
  return ((curr - prev) / prev) * 100;
};

const monthStart = (d) => {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addMonths = (d, months) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
};

const getLastNMonthBuckets = (n) => {
  // returns array of { label, start, end } for last n months including current month
  const now = new Date();
  const currentMonthStart = monthStart(now);
  const buckets = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const start = addMonths(currentMonthStart, -i);
    const end = addMonths(start, 1);
    const label = start.toLocaleString('en-US', { month: 'short' });
    buckets.push({ label, start, end });
  }
  return buckets;
};

const dayName = (index) => {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[index] || '';
};

const sumWalletByType = async ({ match }) => {
  const result = await WalletTransaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  if (result && result.length) return Number(result[0].total) || 0;
  return 0;
};

const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.getAdminOverview = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const prevDate = addMonths(now, -1);

  // Total users and growth vs one month ago (createdAt <= date)
  const totalUsersNow = await User.countDocuments({});
  const totalUsersPrev = await User.countDocuments({
    createdAt: { $lte: prevDate },
  });

  // Deposits / Withdrawals totals (all-time) vs one month ago
  const totalDepositsNow = await sumWalletByType({
    match: {
      createdAt: { $lte: now },
      type: 'deposit',
      status: 'completed',
    },
  });
  const totalDepositsPrev = await sumWalletByType({
    match: {
      createdAt: { $lte: prevDate },
      type: 'deposit',
      status: 'completed',
    },
  });

  const totalWithdrawalsNow = await sumWalletByType({
    match: {
      createdAt: { $lte: now },
      type: 'withdraw',
      status: 'paid',
    },
  });
  const totalWithdrawalsPrev = await sumWalletByType({
    match: {
      createdAt: { $lte: prevDate },
      type: 'withdraw',
      status: 'paid',
    },
  });

  // Active mining plans = count active subscriptions
  const allUsers = await User.find({})
    .select('planSubscriptions')
    .lean();

  const nowTs = Date.now();
  let activeNow = 0;
  for (let i = 0; i < allUsers.length; i += 1) {
    const subs = allUsers[i].planSubscriptions || [];
    for (let j = 0; j < subs.length; j += 1) {
      const s = subs[j];
      if (!s) continue;
      if (s.status !== 'active') continue;
      if (!s.expiresAt) continue;
      const startT = s.subscribedAt ? new Date(s.subscribedAt).getTime() : 0;
      const endT = new Date(s.expiresAt).getTime();
      if (startT <= nowTs && endT > nowTs) activeNow += 1;
    }
  }

  const prevTs = prevDate.getTime();
  let activePrev = 0;
  for (let i = 0; i < allUsers.length; i += 1) {
    const subs = allUsers[i].planSubscriptions || [];
    for (let j = 0; j < subs.length; j += 1) {
      const s = subs[j];
      if (!s) continue;
      if (s.status !== 'active') continue;
      if (!s.expiresAt) continue;
      const startT = s.subscribedAt ? new Date(s.subscribedAt).getTime() : 0;
      const endT = new Date(s.expiresAt).getTime();
      if (startT <= prevTs && endT > prevTs) {
        activePrev += 1;
      }
    }
  }

  // Pending KYC (current)
  const pendingKycNow = await User.countDocuments({ kycStatus: 'pending' });
  const pendingKycPrev = await User.countDocuments({
    kycStatus: 'pending',
    createdAt: { $lte: prevDate },
  });

  // Pending withdrawals = withdraw status pending (monthly prev/current count)
  const pendingWithdrawalsNow = await WalletTransaction.countDocuments({
    type: 'withdraw',
    status: 'pending',
  });
  const pendingWithdrawalsPrev = await WalletTransaction.countDocuments({
    type: 'withdraw',
    status: 'pending',
    createdAt: { $lte: prevDate },
  });

  // Open support tickets
  const openTicketsNow = await SupportTicket.countDocuments({ status: 'open' });
  const openTicketsPrev = await SupportTicket.countDocuments({
    status: 'open',
    createdAt: { $lte: prevDate },
  });

  res.status(200).json({
    status: 'Success',
    data: {
      platform: 'admin',
      currency: 'USD',
      cards: {
        totalUsers: {
          value: totalUsersNow,
          changePercent: percentChange(totalUsersNow, totalUsersPrev),
        },
        totalDeposits: {
          value: totalDepositsNow,
          changePercent: percentChange(totalDepositsNow, totalDepositsPrev),
        },
        totalWithdrawals: {
          value: totalWithdrawalsNow,
          changePercent: percentChange(
            totalWithdrawalsNow,
            totalWithdrawalsPrev
          ),
        },
        activeMiningPlans: {
          value: activeNow,
          changePercent: percentChange(activeNow, activePrev),
        },
        pendingKyc: {
          value: pendingKycNow,
          changePercent: percentChange(pendingKycNow, pendingKycPrev),
        },
        pendingWithdrawals: {
          value: pendingWithdrawalsNow,
          changePercent: percentChange(
            pendingWithdrawalsNow,
            pendingWithdrawalsPrev
          ),
        },
        openSupportTickets: {
          value: openTicketsNow,
          changePercent: percentChange(openTicketsNow, openTicketsPrev),
        },
      },
    },
  });
});

exports.getAdminDepositsWithdrawalsChart = asyncHandler(async (req, res) => {
  const buckets = getLastNMonthBuckets(7);

  // Aggregate deposits by month
  const depositsAgg = await WalletTransaction.aggregate([
    {
      $match: {
        type: 'deposit',
        status: 'completed',
        createdAt: { $gte: buckets[0].start, $lt: buckets[buckets.length - 1].end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const withdrawalsAgg = await WalletTransaction.aggregate([
    {
      $match: {
        type: 'withdraw',
        status: 'paid',
        createdAt: { $gte: buckets[0].start, $lt: buckets[buckets.length - 1].end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const depositsMap = {};
  for (let i = 0; i < depositsAgg.length; i += 1) {
    const key = `${depositsAgg[i]._id.year}-${depositsAgg[i]._id.month}`;
    depositsMap[key] = Number(depositsAgg[i].total) || 0;
  }

  const withdrawalsMap = {};
  for (let i = 0; i < withdrawalsAgg.length; i += 1) {
    const key = `${withdrawalsAgg[i]._id.year}-${withdrawalsAgg[i]._id.month}`;
    withdrawalsMap[key] = Number(withdrawalsAgg[i].total) || 0;
  }

  const deposits = [];
  const withdrawals = [];
  const labels = [];

  for (let i = 0; i < buckets.length; i += 1) {
    const b = buckets[i];
    labels.push(b.label);
    const y = b.start.getFullYear();
    const m = b.start.getMonth() + 1;
    const key = `${y}-${m}`;
    deposits.push(depositsMap[key] || 0);
    withdrawals.push(withdrawalsMap[key] || 0);
  }

  res.status(200).json({
    status: 'Success',
    data: {
      labels,
      series: {
        deposits,
        withdrawals,
      },
      currency: 'USD',
    },
  });
});

exports.getAdminUserGrowthChart = asyncHandler(async (req, res) => {
  const buckets = getLastNMonthBuckets(7);

  // We can do it with one query and grouping
  const usersAgg = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: buckets[0].start, $lt: buckets[buckets.length - 1].end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  for (let i = 0; i < usersAgg.length; i += 1) {
    const key = `${usersAgg[i]._id.year}-${usersAgg[i]._id.month}`;
    map[key] = Number(usersAgg[i].total) || 0;
  }

  const labels = [];
  const values = [];
  for (let i = 0; i < buckets.length; i += 1) {
    const b = buckets[i];
    labels.push(b.label);
    const y = b.start.getFullYear();
    const m = b.start.getMonth() + 1;
    const key = `${y}-${m}`;
    values.push(map[key] || 0);
  }

  res.status(200).json({
    status: 'Success',
    data: {
      labels,
      series: values,
    },
  });
});

exports.getAdminMiningPerformanceChart = asyncHandler(async (req, res, next) => {
  // Weekly: last 7 days
  const now = new Date();
  const start = startOfDay(new Date(now.getTime() - 6 * MS_PER_DAY));

  const users = await User.find({})
    .select('planSubscriptions planSubscriptions.plan planSubscriptions.subscribedAt planSubscriptions.expiresAt planSubscriptions.status planSubscriptions.planName')
    .populate('planSubscriptions.plan')
    .exec();

  // Map day -> totals
  const points = [];
  const earningsByDay = {};
  const hashrateByDay = {};

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start.getTime() + i * MS_PER_DAY);
    const key = d.toISOString().slice(0, 10);
    hashrateByDay[key] = 0;
    earningsByDay[key] = 0;
    points.push({ day: dayName(d.getDay()), date: key });
  }

  // Realized mining profit from mining_profit transactions
  const earningsAgg = await WalletTransaction.aggregate([
    {
      $match: {
        user: { $exists: true },
        type: 'mining_profit',
        status: { $in: ['completed', 'paid'] },
        createdAt: { $gte: start, $lt: new Date(start.getTime() + 7 * MS_PER_DAY) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  for (let i = 0; i < earningsAgg.length; i += 1) {
    earningsByDay[earningsAgg[i]._id] = Number(earningsAgg[i].total) || 0;
  }

  const computeDailyEstimatedEarningsFromPlans = () => {
    for (let u = 0; u < users.length; u += 1) {
      const subs = users[u].planSubscriptions || [];
      for (let s = 0; s < subs.length; s += 1) {
        const sub = subs[s];
        if (!sub) continue;
        if (sub.status !== 'active') continue;
        if (!sub.plan) continue;
        if (!sub.subscribedAt || !sub.expiresAt) continue;

        const plan = sub.plan;
        const investedAmount = Number(plan.price) || 0;
        const roiMin = Number(plan.roiMinPercent || 0);
        const roiMax = Number(plan.roiMaxPercent || 0);
        const roiAvg = (roiMin + roiMax) / 2;
        const dailyDividends = (investedAmount * roiAvg) / 100 / 30;

        for (let i = 0; i < 7; i += 1) {
          const d = new Date(start.getTime() + i * MS_PER_DAY);
          const t = d.getTime();
          const startT = new Date(sub.subscribedAt).getTime();
          const endT = new Date(sub.expiresAt).getTime();
          if (t >= startT && t < endT) {
            const key = d.toISOString().slice(0, 10);
            hashrateByDay[key] += Number(plan.hashrate) || 0;
            // Only add estimated if realized earnings is 0
            if (!earningsByDay[key] || earningsByDay[key] <= 0) {
              earningsByDay[key] += dailyDividends;
            }
          }
        }
      }
    }
  };

  computeDailyEstimatedEarningsFromPlans();

  const hashrateSeries = [];
  const earningsSeries = [];
  const daysLabels = [];
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    daysLabels.push(p.day);
    hashrateSeries.push(hashrateByDay[p.date] || 0);
    earningsSeries.push(earningsByDay[p.date] || 0);
  }

  res.status(200).json({
    status: 'Success',
    data: {
      labels: daysLabels,
      series: {
        hashrate: hashrateSeries,
        earnings: earningsSeries,
      },
      hashrateUnit: 'TH/s',
      currency: 'USD',
    },
  });
});

exports.getAdminRecentTransactions = asyncHandler(async (req, res, next) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const txs = await WalletTransaction.find({})
    .sort('-createdAt')
    .limit(limit)
    .populate('user', 'name email role')
    .populate('createdBy', 'name email role');

  const mapped = txs.map((t) => {
    let label = 'Transaction';
    if (t.type === 'deposit') label = 'Deposit';
    if (t.type === 'withdraw') {
      if (t.status === 'pending') label = 'Withdrawal Pending';
      else if (t.status === 'approved') label = 'Withdrawal Approved';
      else if (t.status === 'rejected') label = 'Withdrawal Rejected';
      else label = 'Withdrawal Paid';
    }
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
      user: t.user || null,
      createdBy: t.createdBy || null,
    };
  });

  res.status(200).json({
    status: 'Success',
    results: mapped.length,
    data: mapped,
  });
});

exports.getAdminAnalyticsOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStartDate = startOfMonth(now);
  const prevMonthStart = startOfMonth(addMonths(now, -1));

  const [
    totalPlatformProfit,
    totalMiningEarnings,
    totalUserDeposits,
    activeUsersToday,
    prevPlatformProfit,
    prevMiningEarnings,
    prevUserDeposits,
    prevActiveUsersToday,
  ] = await Promise.all([
    sumWalletByType({
      match: { type: { $in: ['mining_profit', 'plan_purchase'] } },
    }),
    sumWalletByType({ match: { type: 'mining_profit' } }),
    sumWalletByType({
      match: { type: 'deposit', status: { $in: ['confirmed', 'completed'] } },
    }),
    WalletTransaction.distinct('user', {
      createdAt: { $gte: todayStart },
    }).then((ids) => ids.length),
    sumWalletByType({
      match: {
        type: { $in: ['mining_profit', 'plan_purchase'] },
        createdAt: { $gte: prevMonthStart, $lt: monthStartDate },
      },
    }),
    sumWalletByType({
      match: {
        type: 'mining_profit',
        createdAt: { $gte: prevMonthStart, $lt: monthStartDate },
      },
    }),
    sumWalletByType({
      match: {
        type: 'deposit',
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: prevMonthStart, $lt: monthStartDate },
      },
    }),
    WalletTransaction.distinct('user', {
      createdAt: { $gte: prevMonthStart, $lt: monthStartDate },
    }).then((ids) => ids.length),
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      currency: 'USD',
      cards: {
        totalPlatformProfit: {
          value: totalPlatformProfit,
          changePercent: percentChange(totalPlatformProfit, prevPlatformProfit),
        },
        totalMiningEarnings: {
          value: totalMiningEarnings,
          changePercent: percentChange(totalMiningEarnings, prevMiningEarnings),
        },
        totalUserDeposits: {
          value: totalUserDeposits,
          changePercent: percentChange(totalUserDeposits, prevUserDeposits),
        },
        activeUsersToday: {
          value: activeUsersToday,
          changePercent: percentChange(activeUsersToday, prevActiveUsersToday),
        },
      },
    },
  });
});

exports.getAdminAnalyticsDailyEarnings = asyncHandler(async (req, res) => {
  const days = req.query.days ? Math.max(3, Math.min(31, Number(req.query.days))) : 7;
  const now = new Date();
  const start = startOfDay(new Date(now.getTime() - (days - 1) * MS_PER_DAY));
  const end = new Date(start.getTime() + days * MS_PER_DAY);

  const dailyAgg = await WalletTransaction.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end },
        type: { $in: ['mining_profit', 'plan_purchase'] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const map = {};
  for (let i = 0; i < dailyAgg.length; i += 1) {
    map[dailyAgg[i]._id] = Number(dailyAgg[i].total) || 0;
  }

  const labels = [];
  const series = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start.getTime() + i * MS_PER_DAY);
    const key = d.toISOString().slice(0, 10);
    labels.push(
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    series.push(map[key] || 0);
  }

  res.status(200).json({
    status: 'Success',
    data: {
      labels,
      series,
      currency: 'USD',
    },
  });
});

exports.getAdminAnalyticsUserActivityByHour = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY);

  const hourlyAgg = await WalletTransaction.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lt: tomorrowStart },
      },
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          user: '$user',
        },
      },
    },
    {
      $group: {
        _id: '$_id.hour',
        activeUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byHour = {};
  for (let i = 0; i < hourlyAgg.length; i += 1) {
    byHour[hourlyAgg[i]._id] = hourlyAgg[i].activeUsers;
  }

  const labels = [];
  const series = [];
  for (let h = 0; h < 24; h += 1) {
    labels.push(`${String(h).padStart(2, '0')}:00`);
    series.push(byHour[h] || 0);
  }

  res.status(200).json({
    status: 'Success',
    data: {
      labels,
      series,
    },
  });
});

exports.getAdminAnalyticsPlanDistribution = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('planSubscriptions')
    .populate('planSubscriptions.plan', 'name')
    .lean();

  const nowTs = Date.now();
  const dist = {};
  let totalActiveSubs = 0;

  for (let i = 0; i < users.length; i += 1) {
    const subs = users[i].planSubscriptions || [];
    for (let j = 0; j < subs.length; j += 1) {
      const s = subs[j];
      if (
        s &&
        s.plan &&
        s.status === 'active' &&
        s.expiresAt &&
        new Date(s.expiresAt).getTime() > nowTs
      ) {
        const name = s.plan.name || s.planName || 'Unknown Plan';
        dist[name] = (dist[name] || 0) + 1;
        totalActiveSubs += 1;
      }
    }
  }

  const labels = Object.keys(dist);
  const series = labels.map((name) => dist[name]);
  const items = labels.map((name) => ({
    name,
    subscribers: dist[name],
    percentage:
      totalActiveSubs > 0 ? Number(((dist[name] / totalActiveSubs) * 100).toFixed(2)) : 0,
  }));

  res.status(200).json({
    status: 'Success',
    data: {
      totalActiveSubscribers: totalActiveSubs,
      labels,
      series,
      items,
    },
  });
});

