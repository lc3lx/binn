const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const planBodyRules = [
  body('name')
    .notEmpty()
    .withMessage('Plan name is required')
    .isLength({ min: 2 })
    .withMessage('Plan name is too short'),
  body('price')
    .notEmpty()
    .withMessage('Plan price is required')
    .isFloat({ gt: 0 })
    .withMessage('Plan price must be greater than 0'),
  body('hashrate')
    .notEmpty()
    .withMessage('hashrate is required')
    .isFloat({ gt: 0 })
    .withMessage('hashrate must be greater than 0'),
  body('roiMinPercent')
    .notEmpty()
    .withMessage('roiMinPercent is required')
    .isFloat({ min: 0 })
    .withMessage('roiMinPercent cannot be negative'),
  body('roiMaxPercent')
    .notEmpty()
    .withMessage('roiMaxPercent is required')
    .isFloat({ min: 0 })
    .withMessage('roiMaxPercent cannot be negative'),
  body('durationDays')
    .notEmpty()
    .withMessage('durationDays is required')
    .isInt({ min: 1 })
    .withMessage('durationDays must be at least 1'),
  body('features').optional().isArray().withMessage('features must be an array'),
  body('features.*')
    .optional()
    .isString()
    .withMessage('each feature must be a string'),
];

exports.getPlanValidator = [
  check('id').isMongoId().withMessage('Invalid plan id format'),
  validatorMiddleware,
];

exports.createPlanValidator = [
  ...planBodyRules,
  body('roiMaxPercent').custom((val, { req }) => {
    if (Number(val) < Number(req.body.roiMinPercent)) {
      throw new Error('roiMaxPercent must be >= roiMinPercent');
    }
    return true;
  }),
  validatorMiddleware,
];

exports.updatePlanValidator = [
  check('id').isMongoId().withMessage('Invalid plan id format'),
  body('name').optional().isString().withMessage('name must be a string'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('price must be greater than 0'),
  body('hashrate')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('hashrate must be greater than 0'),
  body('roiMinPercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('roiMinPercent cannot be negative'),
  body('roiMaxPercent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('roiMaxPercent cannot be negative'),
  body('durationDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('durationDays must be at least 1'),
  body('features').optional().isArray().withMessage('features must be an array'),
  body('features.*')
    .optional()
    .isString()
    .withMessage('each feature must be a string'),
  body('isPopular').optional().isBoolean().withMessage('isPopular must be boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  validatorMiddleware,
];

exports.deletePlanValidator = [
  check('id').isMongoId().withMessage('Invalid plan id format'),
  validatorMiddleware,
];

exports.subscribeToPlanValidator = [
  check('id').isMongoId().withMessage('Invalid plan id format'),
  validatorMiddleware,
];

exports.adminPlansManagementQueryValidator = [
  check('status')
    .optional()
    .isIn(['all', 'active', 'inactive'])
    .withMessage('status must be all, active or inactive'),
  validatorMiddleware,
];
