const { body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.updateAdminProfileValidator = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('name must be at least 2 chars'),
  body('phone').optional().isString().withMessage('phone must be a string'),
  body('timezone').optional().isString().withMessage('timezone must be a string'),
  body('language').optional().isString().withMessage('language must be a string'),
  body('profileImg').optional().isString().withMessage('profileImg must be a string'),
  validatorMiddleware,
];

exports.changeAdminPasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('currentPassword is required')
    .isLength({ min: 6 })
    .withMessage('currentPassword must be at least 6 chars'),
  body('newPassword')
    .notEmpty()
    .withMessage('newPassword is required')
    .isLength({ min: 6 })
    .withMessage('newPassword must be at least 6 chars'),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('confirmNewPassword is required')
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error('Password confirmation does not match newPassword');
      }
      return true;
    }),
  validatorMiddleware,
];

