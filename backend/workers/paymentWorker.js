const { processPendingOrders } = require('../services/paymentOrderService');

let timer = null;
let inProgress = false;

const getPollInterval = () => {
  const n = Number(process.env.PAYMENT_POLL_INTERVAL_MS);
  if (!n || n < 10000) return 15000;
  return n;
};

const runCycle = async () => {
  if (inProgress) return;
  inProgress = true;
  try {
    await processPendingOrders();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[PaymentWorker] cycle error: ${err.message}`);
  } finally {
    inProgress = false;
  }
};

exports.startPaymentWorker = () => {
  if (timer) return;

  const interval = getPollInterval();
  // eslint-disable-next-line no-console
  console.log(`[PaymentWorker] starting with interval ${interval}ms`);

  timer = setInterval(runCycle, interval);
  runCycle();
};

exports.stopPaymentWorker = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  // eslint-disable-next-line no-console
  console.log('[PaymentWorker] stopped');
};

