const express = require('express');

const authService = require('../services/authService');
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  subscribeToPlan,
  getMySubscriptions,
  getAdminPlansManagement,
} = require('../services/planService');
const {
  getPlanValidator,
  createPlanValidator,
  updatePlanValidator,
  deletePlanValidator,
  subscribeToPlanValidator,
  adminPlansManagementQueryValidator,
} = require('../utils/validators/planValidator');

const router = express.Router();

router.get('/', getPlans);
router.get('/me/subscriptions', authService.protect, getMySubscriptions);
router.get('/:id', getPlanValidator, getPlan);

router.use(authService.protect);
router.post('/:id/subscribe', subscribeToPlanValidator, subscribeToPlan);

router.use(authService.allowedTo('admin', 'manager'));

router.get(
  '/admin/management',
  adminPlansManagementQueryValidator,
  getAdminPlansManagement
);
router.post('/', createPlanValidator, createPlan);
router.put('/:id', updatePlanValidator, updatePlan);
router.delete('/:id', deletePlanValidator, deletePlan);

module.exports = router;
