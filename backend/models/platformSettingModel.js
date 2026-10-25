const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    bep20DepositWalletAddress: {
      type: String,
      default: '',
      trim: true,
    },
    trc20DepositWalletAddress: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'support@etg-ride.com',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true,
    },
    telegramUrl: {
      type: String,
      default: '',
      trim: true,
    },
    whatsappUrl: {
      type: String,
      default: '',
      trim: true,
    },
    twitterUrl: {
      type: String,
      default: '',
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: '',
      trim: true,
    },
    starterDailyRatePercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    starterDurationDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    eliteDailyRatePercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    eliteDurationDays: {
      type: Number,
      default: 90,
      min: 1,
    },
    minimumWithdrawal: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumWithdrawal: {
      type: Number,
      default: 50000,
      min: 0,
    },
    level1CommissionPercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    level2CommissionPercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Minimum number of active (non-expired) plan subscriptions a referee must hold before their mining profit generates referral payouts. */
    referralActiveMinPlans: {
      type: Number,
      default: 3,
      min: 1,
    },
    /** Base URL for share links, e.g. https://example.com/register — ref query is appended by the API. */
    referralRegistrationBaseUrl: {
      type: String,
      default: '',
      trim: true,
    },
    /**
     * Tiered L1 commission by count of "active" referrals (see referralActiveMinPlans).
     * If empty, level1CommissionPercent applies for all referrers.
     */
    referralTiers: [
      {
        name: { type: String, required: true, trim: true },
        minActiveReferrals: { type: Number, required: true, min: 0 },
        commissionPercent: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);

module.exports = PlatformSetting;

