const dotenv = require('dotenv');
const mongoose = require('mongoose');

const dbConnection = require('../config/database');
const { distributeDailyMiningProfits } = require('../services/miningProfitService');

dotenv.config();

const connect = async () =>
  new Promise((resolve, reject) => {
    mongoose.connection.once('open', resolve);
    mongoose.connection.once('error', reject);
    dbConnection();
  });

const closeDb = async () => {
  try {
    await mongoose.connection.close();
  } catch (err) {
    // ignore close errors
  }
};

(async () => {
  await connect();
  const stats = await distributeDailyMiningProfits();
  // eslint-disable-next-line no-console
  console.log('[backfillMiningProfits] completed', stats);
  await closeDb();
  process.exit(0);
})().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[backfillMiningProfits] failed', err.message);
  await closeDb();
  process.exit(1);
});
