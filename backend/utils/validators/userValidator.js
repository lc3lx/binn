const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation required'),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),

  validatorMiddleware,
];

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('currentPassword')
    .notEmpty()
    .withMessage('You must enter your current password'),
  body('passwordConfirm')
    .notEmpty()
    .withMessage('You must enter the password confirm'),
  body('password')
    .notEmpty()
    .withMessage('You must enter new password')
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error('There is no user for this id');
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  validatorMiddleware,
];

exports.submitKycValidator = [
  body('fullName')
    .exists({ checkFalsy: true })
    .withMessage('fullName is required')
    .isString()
    .withMessage('fullName must be a string')
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('fullName must be between 3 and 120 characters'),
  body('nationalNumber')
    .exists({ checkFalsy: true })
    .withMessage('nationalNumber is required')
    .isString()
    .withMessage('nationalNumber must be a string')
    .trim()
    .matches(/^\d+$/)
    .withMessage('nationalNumber must contain digits only')
    .isLength({ min: 5, max: 30 })
    .withMessage('nationalNumber must be between 5 and 30 digits'),
  validatorMiddleware,
];

exports.reviewKycValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('status')
    .notEmpty()
    .withMessage('KYC status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('KYC status must be approved or rejected'),
  body('rejectionReason').custom((val, { req }) => {
    if (req.body.status === 'rejected' && !val) {
      throw new Error('rejectionReason is required when status is rejected');
    }
    return true;
  }),
  validatorMiddleware,
];

exports.adminUserManagementQueryValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  check('status')
    .optional()
    .isIn(['active', 'pending', 'blocked'])
    .withMessage('status must be active, pending or blocked'),
  check('kycStatus')
    .optional()
    .isIn(['not_submitted', 'pending', 'approved', 'rejected'])
    .withMessage('Invalid kycStatus value'),
  validatorMiddleware,
];

exports.adminUserIdValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.adminAdjustWalletValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('action')
    .notEmpty()
    .withMessage('action is required')
    .isIn(['add', 'remove'])
    .withMessage('action must be add or remove'),
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isFloat({ gt: 0 })
    .withMessage('amount must be greater than 0'),
  body('note').optional().isString().withMessage('note must be a string'),
  validatorMiddleware,
];

exports.adminKycRequestsQueryValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  check('status')
    .optional()
    .isIn(['all', 'approved', 'pending', 'rejected'])
    .withMessage('status must be all, approved, pending or rejected'),
  validatorMiddleware,
];
