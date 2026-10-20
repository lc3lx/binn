const express = require('express');

const authService = require('../services/authService');
const {
  getDashboardSummary,
  getRecentActivity,
  getHashrateSeries,
  getAllocation,
} = require('../services/dashboardService');

const router = express.Router();

router.use(authService.protect);

router.get('/summary', getDashboardSummary);
router.get('/recent-activity', getRecentActivity);
router.get('/hashrate-series', getHashrateSeries);
router.get('/allocation', getAllocation);

module.exports = router;

