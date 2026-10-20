const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createFaqValidator = [
  body('question')
    .notEmpty()
    .withMessage('question is required')
    .isLength({ min: 3 })
    .withMessage('question is too short'),
  body('answer')
    .notEmpty()
    .withMessage('answer is required')
    .isLength({ min: 3 })
    .withMessage('answer is too short'),
  body('category').optional().isString().withMessage('category must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  validatorMiddleware,
];

exports.updateFaqValidator = [
  check('id').isMongoId().withMessage('Invalid FAQ id format'),
  body('question')
    .optional()
    .isString()
    .withMessage('question must be a string')
    .isLength({ min: 3 })
    .withMessage('question is too short'),
  body('answer')
    .optional()
    .isString()
    .withMessage('answer must be a string')
    .isLength({ min: 3 })
    .withMessage('answer is too short'),
  body('category').optional().isString().withMessage('category must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  validatorMiddleware,
];

exports.deleteFaqValidator = [
  check('id').isMongoId().withMessage('Invalid FAQ id format'),
  validatorMiddleware,
];

exports.getFaqValidator = [
  check('id').isMongoId().withMessage('Invalid FAQ id format'),
  validatorMiddleware,
];

exports.adminFaqsQueryValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  check('status')
    .optional()
    .isIn(['active', 'inactive', 'all'])
    .withMessage('status must be active, inactive or all'),
  validatorMiddleware,
];

