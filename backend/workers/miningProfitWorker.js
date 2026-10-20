const { distributeDailyMiningProfits } = require('../services/miningProfitService');

let timer = null;
let inProgress = false;

const getPollInterval = () => {
  const n = Number(process.env.MINING_PROFIT_POLL_INTERVAL_MS);
  if (!n || n < 60000) return 60 * 60 * 1000;
  return n;
};

const runCycle = async () => {
  if (inProgress) return;
  inProgress = true;

  const startedAt = Date.now();
  try {
    const stats = await distributeDailyMiningProfits();
    // eslint-disable-next-line no-console
    console.log(
      `[MiningProfitWorker] cycle done in ${Date.now() - startedAt}ms | users=${stats.usersProcessed} payouts=${stats.payoutsCreated} credited=${stats.totalCredited} referralFailures=${stats.referralFailures}`
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[MiningProfitWorker] cycle error: ${err.message}`);
  } finally {
    inProgress = false;
  }
};

exports.startMiningProfitWorker = () => {
  if (timer) return;

  const interval = getPollInterval();
  // eslint-disable-next-line no-console
  console.log(`[MiningProfitWorker] starting with interval ${interval}ms`);

  timer = setInterval(runCycle, interval);
  runCycle();
};

exports.stopMiningProfitWorker = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  // eslint-disable-next-line no-console
  console.log('[MiningProfitWorker] stopped');
};
