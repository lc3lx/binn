const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    network: {
      type: String,
      default: 'BEP20',
      enum: ['BEP20', 'TRC20'],
    },
    tokenSymbol: {
      type: String,
      default: 'USDT',
      enum: ['USDT'],
    },
    address: {
      type: String,
      required: true,
      index: true,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0.000001,
    },
    microAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedAmount: {
      type: Number,
      required: true,
      min: 0.000001,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'expired'],
      default: 'pending',
      index: true,
    },
    txHash: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    paidAmount: Number,
    paidAt: Date,
    creditedAmount: Number,
    creditedAt: Date,
    creditedTransaction: {
      type: mongoose.Schema.ObjectId,
      ref: 'WalletTransaction',
      unique: true,
      sparse: true,
      index: true,
    },
    mismatchType: {
      type: String,
      enum: ['none', 'underpaid', 'overpaid', 'duplicate_payment'],
      default: 'none',
    },
    mismatchAmount: Number,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastCheckedAt: Date,
  },
  { timestamps: true }
);

const PaymentOrder = mongoose.model('PaymentOrder', paymentOrderSchema);

module.exports = PaymentOrder;
