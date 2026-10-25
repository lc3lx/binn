const express = require('express');
const authService = require('../services/authService');
const {
  getTodayTaskStatus,
  powerOnScooter,
  collectScooterEarnings,
  collectAllScooters,
  completeRideTask,
} = require('../services/taskService');

const router = express.Router();

router.use(authService.protect);

router.get('/today-status', getTodayTaskStatus);
router.post('/power-on', powerOnScooter);
router.post('/collect', collectScooterEarnings);
router.post('/collect-all', collectAllScooters);
router.post('/complete-ride', completeRideTask);

module.exports = router;
