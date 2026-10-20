const express = require('express');

const authService = require('../services/authService');
const {
  getActiveFaqs,
  getAdminFaqs,
  getFaqByIdForAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
} = require('../services/faqService');

const {
  getFaqValidator,
  adminFaqsQueryValidator,
  createFaqValidator,
  updateFaqValidator,
  deleteFaqValidator,
} = require('../utils/validators/faqValidator');

const router = express.Router();

// User view (public)
router.get('/', getActiveFaqs);

// Admin CRUD
router.use(authService.protect);
router.use(authService.allowedTo('admin', 'manager'));

router.get('/admin', adminFaqsQueryValidator, getAdminFaqs);
router.get('/admin/:id', getFaqValidator, getFaqByIdForAdmin);
router.post('/', createFaqValidator, createFaq);
router.put('/:id', updateFaqValidator, updateFaq);
router.delete('/:id', deleteFaqValidator, deleteFaq);

module.exports = router;

