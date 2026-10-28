const TIER_SPECS = {
  50: { modelName: 'E1', name: 'E1', deviceCount: 1, dailyIncome: 2.5, scooterIncome: 2.5, vipTier: 1 },
  100: { modelName: 'E2', name: 'E2', deviceCount: 2, dailyIncome: 5.0, scooterIncome: 2.5, vipTier: 2 },
  200: { modelName: 'E3', name: 'E3', deviceCount: 4, dailyIncome: 10.0, scooterIncome: 2.5, vipTier: 3 },
  500: { modelName: 'E4', name: 'E4', deviceCount: 10, dailyIncome: 25.0, scooterIncome: 2.5, vipTier: 4 },
  1000: { modelName: 'E5', name: 'E5', deviceCount: 20, dailyIncome: 50.0, scooterIncome: 2.5, vipTier: 5 },
  2000: { modelName: 'E6', name: 'E6', deviceCount: 40, dailyIncome: 100.0, scooterIncome: 2.5, vipTier: 6 },
  5000: { modelName: 'E7', name: 'E7', deviceCount: 100, dailyIncome: 250.0, scooterIncome: 2.5, vipTier: 7 },
};

const resolveTierSpecs = (price, existing = {}) => {
  const p = Number(price) || 50;
  if (TIER_SPECS[p]) {
    return {
      modelName: TIER_SPECS[p].modelName,
      name: TIER_SPECS[p].name,
      deviceCount: TIER_SPECS[p].deviceCount,
      dailyIncome: TIER_SPECS[p].dailyIncome,
      scooterIncome: TIER_SPECS[p].scooterIncome,
      vipTier: TIER_SPECS[p].vipTier,
    };
  }

  // 5% daily return, $2.5 per scooter
  const dailyIncome = Number((p * 0.05).toFixed(2));
  const scooterIncome = 2.5;
  const deviceCount = Math.max(1, Math.round(p / 50));
  const vipTier = Math.min(7, Math.max(1, Math.round(p / 50)));
  const modelName =
    existing.modelName && !['E2', 'E2 Scooter'].includes(existing.modelName)
      ? existing.modelName
      : `E${vipTier}`;

  return {
    modelName,
    name: modelName,
    deviceCount,
    dailyIncome,
    scooterIncome,
    vipTier,
  };
};

module.exports = {
  TIER_SPECS,
  resolveTierSpecs,
};
