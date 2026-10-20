const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const Notification = require('../models/notificationModel');

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort(
    '-createdAt'
  );

  res.status(200).json({
    results: notifications.length,
    data: notifications,
  });
});

exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new ApiError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: notification,
  });
});

exports.markAllMyNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });

  res.status(200).json({
    status: 'Success',
    message: 'All notifications marked as read',
  });
});
