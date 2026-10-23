// Must match backend/utils/miningPayout.js:
// every PAYOUT_INTERVAL_DAYS the subscriber earns PAYOUT_PERCENT of the plan price.
export const PAYOUT_INTERVAL_DAYS = 10;
export const PAYOUT_PERCENT = 30;

export const computePeriodProfit = (amount) =>
  ((Number(amount) || 0) * PAYOUT_PERCENT) / 100;

export const countPayouts = (days) =>
  Math.floor((Number(days) || 0) / PAYOUT_INTERVAL_DAYS);
