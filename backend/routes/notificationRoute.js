const express = require('express');

const authService = require('../services/authService');
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllMyNotificationsAsRead,
} = require('../services/notificationService');
const {
  markNotificationAsReadValidator,
} = require('../utils/validators/notificationValidator');

const router = express.Router();

router.use(authService.protect);

router.get('/me', getMyNotifications);
router.put('/me/read-all', markAllMyNotificationsAsRead);
router.put('/me/:id/read', markNotificationAsReadValidator, markNotificationAsRead);

module.exports = router;
