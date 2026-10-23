const User = require('../models/userModel');
require('../models/planModel');
const WalletTransaction = require('../models/walletTransactionModel');
const {
  distributeReferralCommissionsOnMiningProfit,
} = require('./referralService');

const {
  PAYOUT_INTERVAL_DAYS,
  computePeriodProfit,
} = require('../utils/miningPayout');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const dayStartUtc = (value) => {
  const d = value ? new Date(value) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const addDaysUtc = (value, days) => new Date(value.getTime() + days * MS_PER_DAY);

const dayKey = (value) => dayStartUtc(value).toISOString().slice(0, 10);

const getFirstPayoutAt = (subscribedAt) =>
  new Date(new Date(subscribedAt).getTime() + PAYOUT_INTERVAL_DAYS * MS_PER_DAY);

const hasDuplicateKeyError = (err) => Boolean(err && err.code === 11000);

const shouldExpireNow = (sub, nowTs) =>
  sub &&
  sub.status === 'active' &&
  sub.expiresAt &&
  new Date(sub.expiresAt).getTime() <= nowTs;

const inferSubscriptionStatus = (sub, nowTs) => {
  const raw = String((sub && sub.status) || '').toLowerCase();
  if (raw === 'active' || raw === 'expired') return raw;
  if (sub && sub.expiresAt) {
    return new Date(sub.expiresAt).getTime() > nowTs ? 'active' : 'expired';
  }
  return raw;
};

const isProcessableSubscription = (sub, nowTs) =>
  sub &&
  ['active', 'expired'].includes(inferSubscriptionStatus(sub, nowTs)) &&
  sub.subscribedAt &&
  sub.expiresAt &&
  sub.plan;

const resolvePlanId = (plan) => String((plan && plan._id) || plan || '');
const toPlainSub = (sub) =>
  sub && typeof sub.toObject === 'function' ? sub.toObject() : sub;

const normalizeSubscriptionsForProcessing = (userDoc, nowTs) => {
  const fromArray = userDoc.planSubscriptions || [];
  const plainArray = fromArray.map(toPlainSub).filter(Boolean);
  const normalized = plainArray.map((s) => ({
    ...s,
    status: inferSubscriptionStatus(s, nowTs),
  }));

  const legacy = userDoc.currentPlan;
  if (
    legacy &&
    legacy.plan &&
    legacy.subscribedAt &&
    legacy.expiresAt
  ) {
    const legacyPlanId = resolvePlanId(legacy.plan);
    const legacyStart = new Date(legacy.subscribedAt).getTime();
    const legacyEnd = new Date(legacy.expiresAt).getTime();

    const existsInArray = plainArray.some((s) => {
      if (!s || !s.plan || !s.subscribedAt || !s.expiresAt) return false;
      const planId = resolvePlanId(s.plan);
      return (
        planId === legacyPlanId &&
        new Date(s.subscribedAt).getTime() === legacyStart &&
        new Date(s.expiresAt).getTime() === legacyEnd
      );
    });

    if (!existsInArray) {
      normalized.push({
        _id: `legacy-${legacyPlanId}-${legacyStart}-${legacyEnd}`,
        plan: legacy.plan,
        planName: legacy.planName,
        subscribedAt: legacy.subscribedAt,
        expiresAt: legacy.expiresAt,
        status: inferSubscriptionStatus(legacy, nowTs),
      });
    }
  }

  return normalized;
};

const buildSubscriptionPayoutMoments = ({ subscription, now }) => {
  const payoutMoments = [];
  const firstPayoutAt = getFirstPayoutAt(subscription.subscribedAt);
  const expiresAtTs = new Date(subscription.expiresAt).getTime();

  for (
    let payoutAt = new Date(firstPayoutAt);
    payoutAt.getTime() <= now.getTime() && payoutAt.getTime() <= expiresAtTs;
    payoutAt = addDaysUtc(payoutAt, PAYOUT_INTERVAL_DAYS)
  ) {
    payoutMoments.push(new Date(payoutAt));
  }

  return payoutMoments;
};

const createPayoutTransaction = async ({
  userId,
  amount,
  balanceBefore,
  balanceAfter,
  planName,
  payoutMoment,
  subscriptionId,
}) =>
  WalletTransaction.create({
    user: userId,
    type: 'mining_profit',
    status: 'completed',
    amount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `${PAYOUT_INTERVAL_DAYS}-day mining profit (${planName || 'Plan'}) for ${dayKey(
      payoutMoment
    )}`,
    miningSubscriptionId: String(subscriptionId),
    miningProfitDate: dayStartUtc(payoutMoment),
    createdAt: new Date(payoutMoment),
    updatedAt: new Date(payoutMoment),
  });

const collectExistingPayoutKeys = async ({ userId, subscriptionIds, fromDate, toDate }) => {
  if (!subscriptionIds.length) return new Set();

  const txs = await WalletTransaction.find({
    user: userId,
    type: 'mining_profit',
    miningSubscriptionId: { $in: subscriptionIds },
    miningProfitDate: { $gte: fromDate, $lte: toDate },
  }).select('miningSubscriptionId miningProfitDate');

  const keys = new Set();
  for (let i = 0; i < txs.length; i += 1) {
    keys.add(`${txs[i].miningSubscriptionId}|${dayKey(txs[i].miningProfitDate)}`);
  }
  return keys;
};

const processSingleUser = async (user, now) => {
  const stats = {
    usersProcessed: 1,
    payoutsCreated: 0,
    totalCredited: 0,
    referralFailures: 0,
    usersUpdated: 0,
  };

  const nowTs = now.getTime();
  const todayStart = dayStartUtc(now);

  await user.populate([
    { path: 'planSubscriptions.plan' },
    { path: 'currentPlan.plan' },
  ]);

  const subs = user.planSubscriptions || [];
  let hasUserMutation = false;

  for (let i = 0; i < subs.length; i += 1) {
    if (shouldExpireNow(subs[i], nowTs)) {
      subs[i].status = 'expired';
      hasUserMutation = true;
    }
  }

  if (shouldExpireNow(user.currentPlan, nowTs)) {
    user.currentPlan.status = 'expired';
    hasUserMutation = true;
  }

  const processableSubs = normalizeSubscriptionsForProcessing(user, nowTs).filter((sub) =>
    isProcessableSubscription(sub, nowTs)
  );
  if (!processableSubs.length) {
    if (hasUserMutation) {
      await user.save({ validateBeforeSave: false });
      stats.usersUpdated += 1;
    }
    return stats;
  }

  const subscriptionIds = processableSubs.map((s) => String(s._id));
  const earliestDay = processableSubs
    .map((s) => dayStartUtc(getFirstPayoutAt(s.subscribedAt)))
    .reduce((min, day) => (day.getTime() < min.getTime() ? day : min), todayStart);

  const existingKeys = await collectExistingPayoutKeys({
    userId: user._id,
    subscriptionIds,
    fromDate: earliestDay,
    toDate: todayStart,
  });

  for (let i = 0; i < processableSubs.length; i += 1) {
    const sub = processableSubs[i];
    const periodProfit = computePeriodProfit(sub.plan && sub.plan.price);
    if (periodProfit < 0.01) continue;

    const payoutMoments = buildSubscriptionPayoutMoments({
      subscription: sub,
      now,
    });

    for (let j = 0; j < payoutMoments.length; j += 1) {
      const payoutMoment = payoutMoments[j];
      const key = `${String(sub._id)}|${dayKey(payoutMoment)}`;
      if (existingKeys.has(key)) continue;

      const balanceBefore = round2(Number(user.walletBalance) || 0);
      const balanceAfter = round2(balanceBefore + periodProfit);

      user.walletBalance = balanceAfter;
      hasUserMutation = true;
      await user.save({ validateBeforeSave: false });
      stats.usersUpdated += 1;

      let tx;
      try {
        tx = await createPayoutTransaction({
          userId: user._id,
          amount: periodProfit,
          balanceBefore,
          balanceAfter,
          planName: sub.planName || (sub.plan && sub.plan.name),
          payoutMoment,
          subscriptionId: sub._id,
        });
      } catch (err) {
        user.walletBalance = balanceBefore;
        await user.save({ validateBeforeSave: false });
        stats.usersUpdated += 1;

        if (hasDuplicateKeyError(err)) {
          existingKeys.add(key);
          continue;
        }
        throw err;
      }

      stats.payoutsCreated += 1;
      stats.totalCredited = round2(stats.totalCredited + periodProfit);
      existingKeys.add(key);

      try {
        await distributeReferralCommissionsOnMiningProfit({
          refereeId: user._id,
          profitAmount: periodProfit,
          miningTransactionId: tx._id,
        });
      } catch (err) {
        stats.referralFailures += 1;
        // eslint-disable-next-line no-console
        console.error(
          `[MiningProfitService] referral payout failed for tx ${tx._id}: ${err.message}`
        );
      }
    }
  }

  if (user.isModified()) {
    await user.save({ validateBeforeSave: false });
    stats.usersUpdated += 1;
  }

  return stats;
};

const mergeStats = (acc, next) => ({
  usersProcessed: acc.usersProcessed + next.usersProcessed,
  payoutsCreated: acc.payoutsCreated + next.payoutsCreated,
  totalCredited: round2(acc.totalCredited + next.totalCredited),
  referralFailures: acc.referralFailures + next.referralFailures,
  usersUpdated: acc.usersUpdated + next.usersUpdated,
});

exports.distributeDailyMiningProfits = async () => {
  const now = new Date();
  const totals = {
    usersProcessed: 0,
    payoutsCreated: 0,
    totalCredited: 0,
    referralFailures: 0,
    usersUpdated: 0,
  };

  const cursor = User.find({
    active: { $ne: false },
    $or: [
      { 'planSubscriptions.0': { $exists: true } },
      { 'currentPlan.plan': { $exists: true } },
    ],
  })
    .select('walletBalance planSubscriptions currentPlan active')
    .cursor();

  // eslint-disable-next-line no-restricted-syntax
  for await (const user of cursor) {
    const s = await processSingleUser(user, now);
    Object.assign(totals, mergeStats(totals, s));
  }

  return totals;
};
