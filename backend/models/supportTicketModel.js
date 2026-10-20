const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
    },
  },
  { _id: false, timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'ticket user is required'],
    },
    subject: {
      type: String,
      required: [true, 'subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'waiting', 'closed'],
      default: 'open',
    },
    messages: {
      type: [ticketMessageSchema],
      default: [],
    },
    lastReplyAt: Date,
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;
