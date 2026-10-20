const { body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.updatePlatformSettingsValidator = [
  body('bep20DepositWalletAddress')
    .optional()
    .isString()
    .withMessage('bep20DepositWalletAddress must be a string'),
  body('trc20DepositWalletAddress')
    .optional()
    .isString()
    .withMessage('trc20DepositWalletAddress must be a string'),
  body('contactEmail')
    .optional()
    .isString()
    .withMessage('contactEmail must be a string'),
  body('contactPhone')
    .optional()
    .isString()
    .withMessage('contactPhone must be a string'),
  body('telegramUrl')
    .optional()
    .isString()
    .withMessage('telegramUrl must be a string'),
  body('whatsappUrl')
    .optional()
    .isString()
    .withMessage('whatsappUrl must be a string'),
  body('twitterUrl')
    .optional()
    .isString()
    .withMessage('twitterUrl must be a string'),
  body('instagramUrl')
    .optional()
    .isString()
    .withMessage('instagramUrl must be a string'),
  body('starterDailyRatePercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('starterDailyRatePercent must be >= 0'),
  body('starterDurationDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('starterDurationDays must be >= 1'),
  body('eliteDailyRatePercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('eliteDailyRatePercent must be >= 0'),
  body('eliteDurationDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('eliteDurationDays must be >= 1'),
  body('minimumWithdrawal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minimumWithdrawal must be >= 0'),
  body('maximumWithdrawal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maximumWithdrawal must be >= 0'),
  body('level1CommissionPercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('level1CommissionPercent must be >= 0'),
  body('level2CommissionPercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('level2CommissionPercent must be >= 0'),
  body('referralActiveMinPlans')
    .optional()
    .isInt({ min: 1 })
    .withMessage('referralActiveMinPlans must be >= 1'),
  body('referralRegistrationBaseUrl')
    .optional()
    .isString()
    .withMessage('referralRegistrationBaseUrl must be a string'),
  body('referralTiers')
    .optional()
    .isArray()
    .withMessage('referralTiers must be an array'),
  body('referralTiers.*.name')
    .optional()
    .isString()
    .withMessage('each tier name must be a string'),
  body('referralTiers.*.minActiveReferrals')
    .optional()
    .isInt({ min: 0 })
    .withMessage('each tier minActiveReferrals must be >= 0'),
  body('referralTiers.*.commissionPercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('each tier commissionPercent must be >= 0'),
  body('maximumWithdrawal').custom((val, { req }) => {
    if (
      Object.prototype.hasOwnProperty.call(req.body, 'minimumWithdrawal') &&
      Object.prototype.hasOwnProperty.call(req.body, 'maximumWithdrawal')
    ) {
      if (Number(val) < Number(req.body.minimumWithdrawal)) {
        throw new Error('maximumWithdrawal must be >= minimumWithdrawal');
      }
    }
    return true;
  }),
  validatorMiddleware,
];

