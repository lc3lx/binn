const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const FAQ = require('../models/faqModel');

exports.getActiveFaqs = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.search) {
    const search = String(req.query.search).trim();
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (req.query.category) {
    filter.category = String(req.query.category).trim();
  }

  const faqs = await FAQ.find(filter).sort('-updatedAt');
  res.status(200).json({ results: faqs.length, data: faqs });
});

exports.getAdminFaqs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.search) {
    const search = String(req.query.search).trim();
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (req.query.category) {
    filter.category = String(req.query.category).trim();
  }

  const faqs = await FAQ.find(filter).sort('-updatedAt').skip(skip).limit(limit);
  const total = await FAQ.countDocuments(filter);

  const [allCount, activeCount, inactiveCount, categories] = await Promise.all([
    FAQ.countDocuments({}),
    FAQ.countDocuments({ isActive: true }),
    FAQ.countDocuments({ isActive: false }),
    FAQ.distinct('category'),
  ]);

  res.status(200).json({
    summary: {
      totalFaqItems: allCount,
      totalCategories: categories.length,
      activeFaqItems: activeCount,
      inactiveFaqItems: inactiveCount,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    results: faqs.length,
    data: faqs,
  });
});

exports.getFaqByIdForAdmin = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) return next(new ApiError(`No FAQ for this id ${req.params.id}`, 404));
  res.status(200).json({ data: faq });
});

exports.createFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({ data: faq });
});

exports.updateFaq = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!faq) return next(new ApiError(`No FAQ for this id ${req.params.id}`, 404));
  res.status(200).json({ data: faq });
});

exports.deleteFaq = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) return next(new ApiError(`No FAQ for this id ${req.params.id}`, 404));
  res.status(204).send();
});

