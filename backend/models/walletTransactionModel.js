const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'transaction user is required'],
    },
    type: {
      type: String,
      enum: [
        'deposit',
        'withdraw',
        'mining_profit',
        'plan_purchase',
        'referral_commission',
        'referral_milestone_reward',
      ],
      required: [true, 'transaction type is required'],
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'approved', 'rejected', 'paid', 'confirmed'],
      default: 'completed',
    },
    amount: {
      type: Number,
      required: [true, 'transaction amount is required'],
      min: [0.01, 'amount must be greater than zero'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD'],
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    note: String,
    walletAddress: String,
    txHash: String,
    withdrawalFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: Number,
    rejectionReason: String,
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    paidBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    paidAt: Date,
    notificationSentAt: Date,
    notificationId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Notification',
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    /** User whose mining profit triggered this referral payout (downline). */
    referralFromUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    referralLevel: {
      type: Number,
      enum: [1, 2],
    },
    relatedMiningTransaction: {
      type: mongoose.Schema.ObjectId,
      ref: 'WalletTransaction',
    },
    relatedPaymentOrder: {
      type: mongoose.Schema.ObjectId,
      ref: 'PaymentOrder',
      unique: true,
      sparse: true,
      index: true,
    },
    /** Plan subscription sub-document id that generated this mining profit. */
    miningSubscriptionId: {
      type: String,
      index: true,
    },
    /** UTC day bucket this mining profit belongs to (00:00:00.000Z). */
    miningProfitDate: Date,
  },
  { timestamps: true }
);

walletTransactionSchema.index(
  { user: 1, type: 1, miningSubscriptionId: 1, miningProfitDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: 'mining_profit',
      miningSubscriptionId: { $exists: true },
      miningProfitDate: { $exists: true },
    },
  }
);

const WalletTransaction = mongoose.model(
  'WalletTransaction',
  walletTransactionSchema
);

module.exports = WalletTransaction;
