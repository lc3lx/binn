const express = require('express');

const authService = require('../services/authService');
const {
  validateReferralCodePublic,
  getMyReferralProgram,
  claimReferralMilestoneReward,
  getAdminReferralOverview,
  getAdminReferralGrowthChart,
  getAdminTopReferrers,
} = require('../services/referralService');

const router = express.Router();

router.get('/validate/:code', validateReferralCodePublic);

router.use(authService.protect);
router.get('/me', getMyReferralProgram);
router.post('/claim-milestone', claimReferralMilestoneReward);

router.use(authService.allowedTo('admin', 'manager'));
router.get('/admin/overview', getAdminReferralOverview);
router.get('/admin/growth-chart', getAdminReferralGrowthChart);
router.get('/admin/top-referrers', getAdminTopReferrers);

module.exports = router;
