const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'notification user is required'],
    },
    title: {
      type: String,
      required: [true, 'notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'notification message is required'],
    },
    type: {
      type: String,
      enum: ['withdrawal', 'general'],
      default: 'general',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
