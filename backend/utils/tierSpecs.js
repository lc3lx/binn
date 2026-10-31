const TIER_SPECS = {
  50: { modelName: 'E1', name: 'E1', deviceCount: 1, dailyIncome: 2.5, scooterIncome: 2.5, vipTier: 1 },
  100: { modelName: 'E2', name: 'E2', deviceCount: 2, dailyIncome: 5.0, scooterIncome: 2.5, vipTier: 2 },
  200: { modelName: 'E3', name: 'E3', deviceCount: 4, dailyIncome: 10.0, scooterIncome: 2.5, vipTier: 3 },
  500: { modelName: 'E4', name: 'E4', deviceCount: 10, dailyIncome: 25.0, scooterIncome: 2.5, vipTier: 4 },
  1000: { modelName: 'E5', name: 'E5', deviceCount: 20, dailyIncome: 50.0, scooterIncome: 2.5, vipTier: 5 },
  2000: { modelName: 'E6', name: 'E6', deviceCount: 40, dailyIncome: 100.0, scooterIncome: 2.5, vipTier: 6 },
  5000: { modelName: 'E7', name: 'E7', deviceCount: 100, dailyIncome: 250.0, scooterIncome: 2.5, vipTier: 7 },
};

const TASK_DURATION_SECONDS = 5 * 3600; // 5 hours = 18000 seconds

const resolveTierSpecs = (price, existing = {}, referralCount = 0) => {
  const p = Number(price) || 50;
  const count = Math.max(0, Number(referralCount) || 0);

  // Base return is 5%, +0.5% for every person invited
  const baseRatePercent = 5.0;
  const referralBonusPercent = Number((count * 0.5).toFixed(1));
  const totalRatePercent = Number((baseRatePercent + referralBonusPercent).toFixed(1));

  let modelName = 'E1';
  let deviceCount = 1;
  let vipTier = 1;

  if (TIER_SPECS[p]) {
    modelName = TIER_SPECS[p].modelName;
    deviceCount = TIER_SPECS[p].deviceCount;
    vipTier = TIER_SPECS[p].vipTier;
  } else {
    deviceCount = Math.max(1, Math.round(p / 50));
    vipTier = Math.min(7, Math.max(1, Math.round(p / 50)));
    modelName =
      existing.modelName &&
      !['E1', 'E2', 'E2 Scooter', 'E3', 'E4', 'E5', 'E6', 'E7'].includes(existing.modelName)
        ? existing.modelName
        : `E-Fleet (${p} USDT)`;
  }

  // Base daily income at standard 5%
  const baseDailyIncome = Number((p * 0.05).toFixed(2));
  // Boosted daily income with referral bonus
  const dailyIncome = Number(((p * totalRatePercent) / 100).toFixed(2));
  const scooterIncome = Number((dailyIncome / deviceCount).toFixed(2));

  return {
    modelName,
    name: modelName,
    deviceCount,
    dailyIncome,
    baseDailyIncome,
    scooterIncome,
    vipTier,
    referralCount: count,
    baseRatePercent,
    referralBonusPercent,
    totalRatePercent,
  };
};

module.exports = {
  TIER_SPECS,
  TASK_DURATION_SECONDS,
  resolveTierSpecs,
};
