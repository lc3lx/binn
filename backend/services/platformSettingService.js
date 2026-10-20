const asyncHandler = require('express-async-handler');

const PlatformSetting = require('../models/platformSettingModel');

const getOrCreateSettingsDoc = async () => {
  let settings = await PlatformSetting.findOne({});
  if (!settings) {
    settings = await PlatformSetting.create({});
  }
  return settings;
};

exports.getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettingsDoc();
  res.status(200).json({
    status: 'Success',
    data: settings,
  });
});

exports.updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettingsDoc();

  const fields = [
    'bep20DepositWalletAddress',
    'trc20DepositWalletAddress',
    'contactEmail',
    'contactPhone',
    'telegramUrl',
    'whatsappUrl',
    'twitterUrl',
    'instagramUrl',
    'starterDailyRatePercent',
    'starterDurationDays',
    'eliteDailyRatePercent',
    'eliteDurationDays',
    'minimumWithdrawal',
    'maximumWithdrawal',
    'level1CommissionPercent',
    'level2CommissionPercent',
    'referralActiveMinPlans',
    'referralRegistrationBaseUrl',
    'referralTiers',
  ];

  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      settings[key] = req.body[key];
    }
  }

  await settings.save();

  res.status(200).json({
    status: 'Success',
    message: 'Platform settings updated successfully',
    data: settings,
  });
});

