const express = require('express');

const authService = require('../services/authService');
const {
  getAdminOverview,
  getAdminDepositsWithdrawalsChart,
  getAdminUserGrowthChart,
  getAdminMiningPerformanceChart,
  getAdminRecentTransactions,
  getAdminAnalyticsOverview,
  getAdminAnalyticsDailyEarnings,
  getAdminAnalyticsUserActivityByHour,
  getAdminAnalyticsPlanDistribution,
} = require('../services/adminDashboardService');

const router = express.Router();

router.use(authService.protect);
router.use(authService.allowedTo('admin', 'manager'));

router.get('/overview', getAdminOverview);
router.get(
  '/charts/deposits-withdrawals',
  getAdminDepositsWithdrawalsChart
);
router.get('/charts/user-growth', getAdminUserGrowthChart);
router.get(
  '/charts/mining-performance',
  getAdminMiningPerformanceChart
);
router.get('/recent-transactions', getAdminRecentTransactions);
router.get('/analytics/overview', getAdminAnalyticsOverview);
router.get('/analytics/daily-earnings', getAdminAnalyticsDailyEarnings);
router.get('/analytics/user-activity-hourly', getAdminAnalyticsUserActivityByHour);
router.get('/analytics/plan-distribution', getAdminAnalyticsPlanDistribution);

module.exports = router;

