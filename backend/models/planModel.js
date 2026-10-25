const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'plan name is required'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'plan price is required'],
      min: [0.01, 'plan price must be greater than zero'],
    },
    currency: {
      type: String,
      enum: ['USD', 'USDT'],
      default: 'USDT',
    },
    hashrate: {
      type: Number,
      required: [true, 'plan hashrate is required'],
      min: [0, 'hashrate cannot be negative'],
    },
    hashrateUnit: {
      type: String,
      enum: ['TH/s', 'PH/s'],
      default: 'TH/s',
    },
    roiMinPercent: {
      type: Number,
      required: [true, 'roi min percent is required'],
      min: [0, 'roi min percent cannot be negative'],
    },
    roiMaxPercent: {
      type: Number,
      required: [true, 'roi max percent is required'],
      min: [0, 'roi max percent cannot be negative'],
    },
    durationDays: {
      type: Number,
      required: [true, 'duration days is required'],
      min: [1, 'duration must be at least 1 day'],
    },
    features: {
      type: [String],
      default: [],
    },
    dailyTasks: {
      type: Number,
      default: 1,
      min: 1,
    },
    modelName: {
      type: String,
      default: 'E2',
    },
    deviceCount: {
      type: Number,
      default: 4,
    },
    scooterIncome: {
      type: Number,
      default: 1.6,
    },
    vehicleType: {
      type: String,
      default: 'Electric Scooter',
    },
    vipTier: {
      type: Number,
      default: 1,
    },
    dailyIncome: {
      type: Number,
      default: 0,
    },
    vehicleImage: {
      type: String,
      default: '/scooter_transparent.png',
    },
    scooterImage: {
      type: String,
      default: '/scooter_transparent.png',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
