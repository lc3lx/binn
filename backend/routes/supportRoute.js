const express = require('express');

const authService = require('../services/authService');
const {
  createSupportTicket,
  getMySupportTickets,
  addUserMessageToTicket,
  getAllSupportTickets,
  adminReplyToTicket,
  updateTicketStatusByAdmin,
} = require('../services/supportService');
const { aiChatSupport } = require('../services/aiSupportService');
const {
  createSupportTicketValidator,
  addSupportMessageValidator,
  updateTicketStatusValidator,
  adminSupportQueryValidator,
} = require('../utils/validators/supportValidator');

const router = express.Router();

// Public route: AI Support Chatbot (OpenRouter / Fallback Intelligent Concierge)
router.post('/ai-chat', aiChatSupport);

router.use(authService.protect);

router.post('/', createSupportTicketValidator, createSupportTicket);
router.get('/me', getMySupportTickets);
router.put('/me/:id/message', addSupportMessageValidator, addUserMessageToTicket);

router.use(authService.allowedTo('admin', 'manager'));

router.get('/', adminSupportQueryValidator, getAllSupportTickets);
router.put('/:id/reply', addSupportMessageValidator, adminReplyToTicket);
router.put('/:id/status', updateTicketStatusValidator, updateTicketStatusByAdmin);

module.exports = router;
