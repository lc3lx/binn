const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const SupportTicket = require('../models/supportTicketModel');

exports.createSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject: req.body.subject,
    messages: [
      {
        sender: req.user._id,
        senderRole: req.user.role,
        message: req.body.message,
      },
    ],
    lastReplyAt: Date.now(),
  });

  res.status(201).json({
    status: 'Success',
    message: 'Support ticket created successfully',
    data: ticket,
  });
});

exports.getMySupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .sort('-updatedAt')
    .populate('user', 'name email');

  res.status(200).json({
    results: tickets.length,
    data: tickets,
  });
});

exports.addUserMessageToTicket = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!ticket) {
    return next(new ApiError('Support ticket not found', 404));
  }
  if (ticket.status === 'closed') {
    return next(new ApiError('This ticket is closed', 400));
  }

  ticket.messages.push({
    sender: req.user._id,
    senderRole: req.user.role,
    message: req.body.message,
  });
  // User replied, so ticket is open and waiting for admin action.
  ticket.status = 'open';
  ticket.lastReplyAt = Date.now();
  await ticket.save();

  res.status(200).json({
    status: 'Success',
    message: 'Message sent to admin support',
    data: ticket,
  });
});

exports.getAllSupportTickets = asyncHandler(async (req, res) => {
  const queryStatus = req.query.status ? String(req.query.status).toLowerCase() : 'active';
  const filter = {};
  if (queryStatus === 'all') {
    // no filter
  } else if (queryStatus === 'active') {
    // Default behavior for admin page: hide closed after finishing.
    filter.status = { $in: ['open', 'waiting'] };
  } else {
    filter.status = queryStatus;
  }

  const tickets = await SupportTicket.find(filter)
    .sort('-updatedAt')
    .populate('user', 'name email')
    .populate('messages.sender', 'name email role');

  const [openCount, waitingCount, closedCount, allCount] = await Promise.all([
    SupportTicket.countDocuments({ status: 'open' }),
    SupportTicket.countDocuments({ status: 'waiting' }),
    SupportTicket.countDocuments({ status: 'closed' }),
    SupportTicket.countDocuments({}),
  ]);

  res.status(200).json({
    counters: {
      all: allCount,
      open: openCount,
      waiting: waitingCount,
      closed: closedCount,
    },
    results: tickets.length,
    data: tickets,
  });
});

exports.adminReplyToTicket = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return next(new ApiError('Support ticket not found', 404));
  }
  if (ticket.status === 'closed') {
    return next(new ApiError('This ticket is closed', 400));
  }

  ticket.messages.push({
    sender: req.user._id,
    senderRole: req.user.role,
    message: req.body.message,
  });
  // Admin replied, so ticket is waiting for user's response unless closed manually.
  ticket.status = 'waiting';
  ticket.lastReplyAt = Date.now();
  await ticket.save();

  res.status(200).json({
    status: 'Success',
    message: 'Admin reply sent',
    data: ticket,
  });
});

exports.updateTicketStatusByAdmin = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!ticket) {
    return next(new ApiError('Support ticket not found', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: 'Ticket status updated',
    data: ticket,
  });
});
