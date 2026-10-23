// Every PAYOUT_INTERVAL_DAYS the subscriber earns PAYOUT_PERCENT of the plan price
// (e.g. plan 100 -> 30, plan 200 -> 60).
const PAYOUT_INTERVAL_DAYS = 10;
const PAYOUT_PERCENT = 30;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Amount credited on each payout.
const computePeriodProfit = (price) =>
  round2(((Number(price) || 0) * PAYOUT_PERCENT) / 100);

// Average profit per day (for estimates/display only).
const computeAvgDailyProfit = (price) =>
  ((Number(price) || 0) * PAYOUT_PERCENT) / 100 / PAYOUT_INTERVAL_DAYS;

const countPayouts = (durationDays) =>
  Math.floor((Number(durationDays) || 0) / PAYOUT_INTERVAL_DAYS);

module.exports = {
  PAYOUT_INTERVAL_DAYS,
  PAYOUT_PERCENT,
  computePeriodProfit,
  computeAvgDailyProfit,
  countPayouts,
};
