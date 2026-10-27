const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('يرجى إدخال الاسم / Name required')
    .isLength({ min: 2 })
    .withMessage('الاسم يجب أن يتكون من حرفين على الأقل / Name must be at least 2 characters')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('يرجى إدخال البريد الإلكتروني / Email required')
    .isEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صالح / Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error(
              'البريد الإلكتروني مستخدم بالفعل، يرجى تسجيل الدخول أو استخدام بريد آخر / E-mail already registered'
            )
          );
        }
      })
    ),

  check('password')
    .notEmpty()
    .withMessage('يرجى إدخال كلمة المرور / Password required')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تتكون من 6 خانات على الأقل / Password must be at least 6 characters')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('كلمتا المرور غير متطابقتين / Password confirmation does not match');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('يرجى تأكيد كلمة المرور / Password confirmation required'),

  check('referralCode')
    .optional()
    .isString()
    .withMessage('كود الإحالة غير صالح / Invalid referral code')
    .trim()
    .custom(async (val) => {
      if (!val) return true;
      const inviter = await User.findOne({
        referralCode: String(val).trim().toUpperCase(),
        active: true,
      }).select('_id');
      if (!inviter) {
        throw new Error('كود الإحالة غير صالح أو غير نشط / Invalid or inactive referral code');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('يرجى إدخال البريد الإلكتروني / Email required')
    .isEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صالح / Invalid email address'),

  check('password')
    .notEmpty()
    .withMessage('يرجى إدخال كلمة المرور / Password required')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تتكون من 6 خانات على الأقل / Password must be at least 6 characters'),

  validatorMiddleware,
];
