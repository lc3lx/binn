const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateUniqueReferralCode = async (UserModel, excludeUserId) => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const q = { referralCode: code };
    if (excludeUserId) q._id = { $ne: excludeUserId };
    // eslint-disable-next-line no-await-in-loop
    const exists = await UserModel.exists(q);
    if (!exists) return code;
  }
  throw new Error('Could not allocate referral code');
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'name required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    lastLogin: Date,

    password: {
      type: String,
      required: function () {
        return this.authProvider !== 'google';
      },
      minlength: [6, 'Too short password'],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentPlan: {
      plan: {
        type: mongoose.Schema.ObjectId,
        ref: 'Plan',
      },
      planName: String,
      subscribedAt: Date,
      expiresAt: Date,
      status: {
        type: String,
        enum: ['none', 'active', 'expired', 'cancelled'],
        default: 'none',
      },
    },
    planSubscriptions: [
      {
        plan: {
          type: mongoose.Schema.ObjectId,
          ref: 'Plan',
          required: true,
        },
        planName: { type: String },
        subscribedAt: { type: Date },
        expiresAt: { type: Date },
        status: {
          type: String,
          enum: ['active', 'expired', 'cancelled'],
          default: 'active',
        },
      },
    ],
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'approved',
    },
    kycDocuments: {
      frontImage: String,
      backImage: String,
      fullName: String,
      nationalNumber: String,
      submittedAt: Date,
    },
    kycReview: {
      reviewedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
      rejectionReason: String,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    /** Number of $100 referral milestone rewards claimed (1 per 10 active depositing referrals). */
    claimedReferralMilestones: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Total amount earned from referral milestone rewards. */
    totalReferralMilestonesEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Ride tasks completed today. */
    todayTasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Date string of last task run in YYYY-MM-DD format (for daily reset). */
    lastTaskDate: {
      type: String,
      default: '',
    },
    /** Total earnings accumulated from ride tasks. */
    totalTaskEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    numericId: {
      type: Number,
      default: function () {
        return Math.floor(1000 + Math.random() * 9000);
      },
    },
    activeScooters: [
      {
        plan: { type: mongoose.Schema.ObjectId, ref: 'Plan' },
        modelName: { type: String, default: 'E1' },
        deviceCount: { type: Number, default: 1 },
        scooterIncome: { type: Number, default: 2.5 },
        dailyIncome: { type: Number, default: 2.5 },
        price: { type: Number, default: 50 },
        status: {
          type: String,
          enum: ['OPEN', 'PROGRESS', 'COMPLETED'],
          default: 'OPEN',
        },
        countdownEndsAt: { type: Date },
        lastClaimDate: { type: String, default: '' },
        pendingIncome: { type: Number, default: 0 },
        totalCollected: { type: Number, default: 0 },
        purchasedAt: { type: Date, default: Date.now },
      },
    ],
    pendingScooterIncome: {
      type: Number,
      default: 0,
    },
    todayScooterIncome: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Skip hashing when password is not provided (e.g. Google OAuth user)
  if (!this.password) return next();
  if (!this.isModified('password')) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', async function (next) {
  try {
    if (!this.referralCode) {
      const UserModel = this.constructor;
      this.referralCode = await generateUniqueReferralCode(UserModel, this._id);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
