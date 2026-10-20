const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
const PlatformSetting = require('../models/platformSettingModel');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const getOrCreateSettings = async () => {
  let settings = await PlatformSetting.findOne({});
  if (!settings) {
    settings = await PlatformSetting.create({});
  }
  return settings;
};

const countActivePlansOnUserDoc = (userDoc) => {
  const now = Date.now();
  const subs = userDoc.planSubscriptions || [];
  return subs.filter(
    (s) =>
      s &&
      s.status === 'active' &&
      s.expiresAt &&
      new Date(s.expiresAt).getTime() > now
  ).length;
};

const normalizeTiers = (settings) => {
  const raw = settings.referralTiers && settings.referralTiers.length;
  const tiers = raw
    ? settings.referralTiers.map((t) => ({
        name: t.name,
        minActiveReferrals: Number(t.minActiveReferrals) || 0,
        commissionPercent: Number(t.commissionPercent) || 0,
      }))
    : [
        {
          name: 'Default',
          minActiveReferrals: 0,
          commissionPercent: Number(settings.level1CommissionPercent) || 0,
        },
      ];
  return tiers.sort((a, b) => a.minActiveReferrals - b.minActiveReferrals);
};

const pickTierForCount = (activeReferralCount, tiers) => {
  let current = tiers[0];
  for (let i = 0; i < tiers.length; i += 1) {
    if (activeReferralCount >= tiers[i].minActiveReferrals) current = tiers[i];
  }
  return current;
};

const pickNextTier = (activeReferralCount, tiers) => {
  const sorted = [...tiers].sort((a, b) => a.minActiveReferrals - b.minActiveReferrals);
  return sorted.find((t) => t.minActiveReferrals > activeReferralCount) || null;
};

exports.countActiveReferralsForReferrer = async (referrerId, settings) => {
  const minPlans = Number(settings.referralActiveMinPlans) || 1;
  const downlines = await User.find({ referredBy: referrerId })
    .select('planSubscriptions')
    .lean();
  let n = 0;
  for (let i = 0; i < downlines.length; i += 1) {
    if (countActivePlansOnUserDoc(downlines[i]) >= minPlans) n += 1;
  }
  return n;
};

/**
 * Counts referrals who have registered and either made a deposit or subscribed to an active mining plan.
 */
exports.countQualifiedDepositingReferrals = async (referrerId) => {
  const downlines = await User.find({ referredBy: referrerId })
    .select('_id planSubscriptions')
    .lean();
  if (!downlines.length) return { count: 0, qualifiedUserIds: [] };

  const downlineIds = downlines.map((u) => u._id);
  const depositedUserIds = await WalletTransaction.distinct('user', {
    user: { $in: downlineIds },
    type: 'deposit',
    status: { $in: ['confirmed', 'completed'] },
  });
  const depositedSet = new Set(depositedUserIds.map((id) => String(id)));

  const qualifiedUserIds = [];
  for (let i = 0; i < downlines.length; i += 1) {
    const u = downlines[i];
    const hasActivePlan = countActivePlansOnUserDoc(u) >= 1;
    const hasDeposit = depositedSet.has(String(u._id));
    if (hasActivePlan || hasDeposit) {
      qualifiedUserIds.push(u._id);
    }
  }

  return {
    count: qualifiedUserIds.length,
    qualifiedUserIds,
  };
};

exports.resolveInviterIdFromReferralCode = async (code) => {
  if (!code || !String(code).trim()) return null;
  const normalized = String(code).trim().toUpperCase();
  const inviter = await User.findOne({ referralCode: normalized }).select('_id active');
  if (!inviter || inviter.active === false) return null;
  return inviter._id;
};

const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  if (local.length <= 2) return `**@${domain}`;
  return `${local.slice(0, 3)}***@${domain}`;
};

/**
 * When a user receives mining_profit, pay L1 (tiered %) and L2 (global %) from that profit amount.
 * L1 rate depends on how many "active" referrals the direct referrer has.
 */
exports.distributeReferralCommissionsOnMiningProfit = async ({
  refereeId,
  profitAmount,
  miningTransactionId,
}) => {
  const settings = await getOrCreateSettings();
  const minPlans = Number(settings.referralActiveMinPlans) || 1;

  const referee = await User.findById(refereeId).select('referredBy planSubscriptions');
  if (!referee || !referee.referredBy) return;

  if (countActivePlansOnUserDoc(referee) < minPlans) return;

  const profit = round2(Number(profitAmount));
  if (profit <= 0) return;

  const l1 = await User.findById(referee.referredBy).select('walletBalance referredBy active');
  if (!l1 || l1.active === false) return;

  const activeForTier = await exports.countActiveReferralsForReferrer(l1._id, settings);
  const tiers = normalizeTiers(settings);
  const tier = pickTierForCount(activeForTier, tiers);
  const pct1 = Number(tier.commissionPercent) || 0;
  const p1 = round2((profit * pct1) / 100);

  if (p1 >= 0.01) {
    await creditReferralPayout(l1, p1, {
      level: 1,
      fromUser: referee._id,
      miningTx: miningTransactionId,
    });
  }

  const pct2 = Number(settings.level2CommissionPercent) || 0;
  if (pct2 > 0 && l1.referredBy) {
    const l2 = await User.findById(l1.referredBy).select('walletBalance active');
    if (l2 && l2.active !== false) {
      const p2 = round2((profit * pct2) / 100);
      if (p2 >= 0.01) {
        await creditReferralPayout(l2, p2, {
          level: 2,
          fromUser: referee._id,
          miningTx: miningTransactionId,
        });
      }
    }
  }
};

async function creditReferralPayout(recipient, amount, meta) {
  const balanceBefore = recipient.walletBalance || 0;
  const balanceAfter = round2(balanceBefore + amount);
  recipient.walletBalance = balanceAfter;
  await recipient.save({ validateBeforeSave: false });

  await WalletTransaction.create({
    user: recipient._id,
    type: 'referral_commission',
    status: 'completed',
    amount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `Referral L${meta.level} commission (from downline mining profit)`,
    referralFromUser: meta.fromUser,
    referralLevel: meta.level,
    relatedMiningTransaction: meta.miningTx,
  });
}

function buildReferralLink(settings, code) {
  const base =
    (settings.referralRegistrationBaseUrl && String(settings.referralRegistrationBaseUrl).trim()) ||
    process.env.FRONTEND_REGISTER_URL ||
    '';
  if (!base) {
    return { referralLink: '', referralLinkHint: 'Set referralRegistrationBaseUrl or FRONTEND_REGISTER_URL' };
  }
  const trimmed = base.replace(/\/$/, '');
  const sep = trimmed.includes('?') ? '&' : '?';
  return { referralLink: `${trimmed}${sep}ref=${encodeURIComponent(code)}` };
}

exports.getMyReferralProgram = asyncHandler(async (req, res, next) => {
  const settings = await getOrCreateSettings();
  let me = await User.findById(req.user._id).select(
    'referralCode referredBy claimedReferralMilestones totalReferralMilestonesEarned'
  );
  if (!me) {
    return next(new ApiError('User not found', 404));
  }
  if (!me.referralCode) {
    await me.save({ validateBeforeSave: false });
    me = await User.findById(req.user._id).select(
      'referralCode referredBy claimedReferralMilestones totalReferralMilestonesEarned'
    );
  }
  if (!me.referralCode) {
    return next(new ApiError('Referral code not ready', 500));
  }

  const [totalSignups, earningsAgg, activeReferralCount, qualifiedResult] = await Promise.all([
    User.countDocuments({ referredBy: me._id }),
    WalletTransaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(String(me._id)),
          type: { $in: ['referral_commission', 'referral_milestone_reward'] },
          status: 'completed',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    exports.countActiveReferralsForReferrer(me._id, settings),
    exports.countQualifiedDepositingReferrals(me._id),
  ]);

  const totalEarnings =
    earningsAgg && earningsAgg.length ? round2(Number(earningsAgg[0].total) || 0) : 0;

  const tiers = normalizeTiers(settings);
  const currentTier = pickTierForCount(activeReferralCount, tiers);
  const nextTier = pickNextTier(activeReferralCount, tiers);
  const referralsNeededForNext = nextTier
    ? Math.max(0, nextTier.minActiveReferrals - activeReferralCount)
    : 0;

  const linkInfo = buildReferralLink(settings, me.referralCode);

  // 10 Referrals = $100 Cash Milestone Rewards System
  const qualifiedDepositingCount = qualifiedResult.count;
  const claimedMilestones = me.claimedReferralMilestones || 0;
  const totalMilestonesUnlocked = Math.floor(qualifiedDepositingCount / 10);
  const unclaimedMilestones = Math.max(0, totalMilestonesUnlocked - claimedMilestones);
  const unclaimedRewardAmount = unclaimedMilestones * 100;

  const nextMilestoneTarget = (Math.floor(qualifiedDepositingCount / 10) + 1) * 10;
  const referralsNeededForNextReward = Math.max(0, nextMilestoneTarget - qualifiedDepositingCount);
  const progressToNextRewardPercent = Math.min(
    100,
    Math.round(((qualifiedDepositingCount % 10) / 10) * 100)
  );

  const milestoneRoadmap = [10, 20, 30, 40, 50].map((target, idx) => {
    const milestoneIndex = idx + 1;
    let status = 'locked';
    if (claimedMilestones >= milestoneIndex) {
      status = 'claimed';
    } else if (qualifiedDepositingCount >= target) {
      status = 'ready';
    } else if (qualifiedDepositingCount >= target - 10) {
      status = 'in_progress';
    }
    return {
      tierIndex: milestoneIndex,
      target,
      rewardAmount: 100,
      totalRewardCumulative: milestoneIndex * 100,
      status,
    };
  });

  const downlines = await User.find({ referredBy: me._id })
    .sort('-createdAt')
    .limit(30)
    .select('email createdAt planSubscriptions')
    .lean();

  const downlineIds = downlines.map((u) => u._id);
  const earnedByRef =
    downlineIds.length > 0
      ? await WalletTransaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(String(me._id)),
              type: { $in: ['referral_commission', 'referral_milestone_reward'] },
              referralFromUser: { $in: downlineIds },
            },
          },
          { $group: { _id: '$referralFromUser', total: { $sum: '$amount' } } },
        ])
      : [];
  const earnedMap = {};
  for (let i = 0; i < earnedByRef.length; i += 1) {
    earnedMap[String(earnedByRef[i]._id)] = round2(Number(earnedByRef[i].total) || 0);
  }

  const qualifiedSet = new Set(qualifiedResult.qualifiedUserIds.map((id) => String(id)));
  const minPlans = Number(settings.referralActiveMinPlans) || 1;
  const recentReferrals = downlines.map((u) => {
    const activePlans = countActivePlansOnUserDoc(u);
    const isDepositedOrActive = qualifiedSet.has(String(u._id));
    return {
      userMasked: maskEmail(u.email),
      joinedAt: u.createdAt,
      status: isDepositedOrActive ? 'Active' : 'Pending',
      hasDeposited: isDepositedOrActive,
      activePlansCount: activePlans,
      earnedFromUser: round2(earnedMap[String(u._id)] || 0),
    };
  });

  res.status(200).json({
    status: 'Success',
    data: {
      currency: 'USD',
      referralCode: me.referralCode,
      ...linkInfo,
      totalReferrals: totalSignups,
      totalEarnings,
      tier: {
        name: currentTier.name,
        commissionPercent: currentTier.commissionPercent,
        activeReferralsForTier: activeReferralCount,
        nextTier: nextTier
          ? {
              name: nextTier.name,
              commissionPercent: nextTier.commissionPercent,
              minActiveReferrals: nextTier.minActiveReferrals,
            }
          : null,
        referralsNeededForNext,
      },
      milestones: {
        rewardPerTen: 100,
        qualifiedDepositingCount,
        claimedMilestones,
        totalMilestonesUnlocked,
        unclaimedMilestones,
        unclaimedRewardAmount,
        totalMilestoneEarnings: me.totalReferralMilestonesEarned || 0,
        nextMilestoneTarget,
        referralsNeededForNextReward,
        progressToNextRewardPercent,
        canClaim: unclaimedMilestones > 0,
        roadmap: milestoneRoadmap,
      },
      settingsSnapshot: {
        referralActiveMinPlans: minPlans,
        level2CommissionPercent: Number(settings.level2CommissionPercent) || 0,
        minimumWithdrawal: Number(settings.minimumWithdrawal) || 0,
      },
      recentReferrals,
    },
  });
});

/**
 * Claim earned referral milestone rewards ($100 per 10 active depositing referrals).
 * Instantly credits the user's walletBalance so they can withdraw or invest.
 */
exports.claimReferralMilestoneReward = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const qualifiedResult = await exports.countQualifiedDepositingReferrals(user._id);
  const qualifiedCount = qualifiedResult.count;
  const claimed = Number(user.claimedReferralMilestones) || 0;
  const totalEarned = Math.floor(qualifiedCount / 10);
  const unclaimed = Math.max(0, totalEarned - claimed);

  if (unclaimed < 1) {
    return next(
      new ApiError(
        `No unclaimed milestone rewards available. Every 10 active depositing referrals unlock $100. You currently have ${qualifiedCount} qualified referrals.`,
        400
      )
    );
  }

  const rewardAmount = unclaimed * 100;
  const balanceBefore = Number(user.walletBalance) || 0;
  const balanceAfter = balanceBefore + rewardAmount;

  user.walletBalance = balanceAfter;
  user.claimedReferralMilestones = claimed + unclaimed;
  user.totalReferralMilestonesEarned = (Number(user.totalReferralMilestonesEarned) || 0) + rewardAmount;
  await user.save();

  const transaction = await WalletTransaction.create({
    user: user._id,
    type: 'referral_milestone_reward',
    status: 'completed',
    amount: rewardAmount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: `Referral milestone reward: $${rewardAmount} for ${unclaimed * 10} qualified depositing referrals`,
    createdBy: user._id,
  });

  const Notification = require('../models/notificationModel');
  await Notification.create({
    user: user._id,
    title: 'Referral Milestone Reward Claimed! 🎉',
    message: `Congratulations! You received $${rewardAmount} USDT bonus for referring ${unclaimed * 10} active depositing members. The balance is in your wallet and available for instant withdrawal!`,
    type: 'referral',
  }).catch(() => {});

  res.status(200).json({
    status: 'Success',
    message: `Successfully claimed $${rewardAmount} referral bonus!`,
    data: {
      claimedAmount: rewardAmount,
      newBalance: balanceAfter,
      totalClaimedMilestones: user.claimedReferralMilestones,
      transactionId: transaction._id,
    },
  });
});

exports.validateReferralCodePublic = asyncHandler(async (req, res) => {
  const code = req.params.code;
  const inviterId = await exports.resolveInviterIdFromReferralCode(code);
  res.status(200).json({
    status: 'Success',
    data: { valid: Boolean(inviterId) },
  });
});

const monthBuckets = (n) => {
  const buckets = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = start.toLocaleString('en-US', { month: 'short' });
    buckets.push({ label, start, end });
  }
  return buckets;
};

exports.getAdminReferralOverview = asyncHandler(async (req, res) => {
  const totalReferralSignups = await User.countDocuments({
    referredBy: { $ne: null },
  });

  const commissionsAgg = await WalletTransaction.aggregate([
    { $match: { type: 'referral_commission', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalCommissionsPaid =
    commissionsAgg && commissionsAgg.length ? round2(Number(commissionsAgg[0].total) || 0) : 0;

  const referrerIds = await User.distinct('referredBy', {
    referredBy: { $ne: null },
  });
  const activeReferrers = referrerIds.filter(Boolean).length;

  const avgPerReferrer =
    activeReferrers > 0 ? round2(totalCommissionsPaid / activeReferrers) : 0;

  res.status(200).json({
    status: 'Success',
    data: {
      currency: 'USD',
      totalReferrals: totalReferralSignups,
      totalCommissionsPaid,
      activeReferrers,
      avgPerReferrer,
    },
  });
});

exports.getAdminReferralGrowthChart = asyncHandler(async (req, res) => {
  const buckets = monthBuckets(8);
  const start = buckets[0].start;
  const end = buckets[buckets.length - 1].end;

  const agg = await User.aggregate([
    {
      $match: {
        referredBy: { $ne: null },
        createdAt: { $gte: start, $lt: end },
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
  for (let i = 0; i < agg.length; i += 1) {
    const k = `${agg[i]._id.year}-${agg[i]._id.month}`;
    map[k] = Number(agg[i].total) || 0;
  }

  const labels = [];
  const series = [];
  for (let i = 0; i < buckets.length; i += 1) {
    const b = buckets[i];
    labels.push(b.label);
    const key = `${b.start.getFullYear()}-${b.start.getMonth() + 1}`;
    series.push(map[key] || 0);
  }

  res.status(200).json({
    status: 'Success',
    data: {
      title: 'Referral Growth',
      labels,
      series,
    },
  });
});

exports.getAdminTopReferrers = asyncHandler(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const settings = await getOrCreateSettings();

  const earningsAgg = await WalletTransaction.aggregate([
    { $match: { type: 'referral_commission', status: 'completed', referralLevel: 1 } },
    { $group: { _id: '$user', earnings: { $sum: '$amount' } } },
    { $sort: { earnings: -1 } },
    { $limit: limit },
  ]);

  const userIds = earningsAgg.map((r) => r._id);
  const users = await User.find({ _id: { $in: userIds } })
    .select('name referralCode')
    .lean();
  const byId = {};
  for (let i = 0; i < users.length; i += 1) {
    byId[String(users[i]._id)] = users[i];
  }

  const tiers = normalizeTiers(settings);
  const built = await Promise.all(
    earningsAgg.map(async (row) => {
      const u = byId[String(row._id)];
      if (!u) return null;
      const [activeRefCount, totalRefs] = await Promise.all([
        exports.countActiveReferralsForReferrer(row._id, settings),
        User.countDocuments({ referredBy: row._id }),
      ]);
      const tier = pickTierForCount(activeRefCount, tiers);
      return {
        userId: row._id,
        name: u.name,
        referralCode: u.referralCode || '',
        totalReferrals: totalRefs,
        earnings: round2(Number(row.earnings) || 0),
        tierCommissionPercent: tier.commissionPercent,
      };
    })
  );
  const rows = built
    .filter(Boolean)
    .map((r, i) => ({ rank: i + 1, ...r }));

  res.status(200).json({
    status: 'Success',
    results: rows.length,
    data: rows,
  });
});
