const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'answer is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;

