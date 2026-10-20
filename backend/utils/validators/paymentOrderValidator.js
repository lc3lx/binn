const { body, check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createOrderValidator = [
  body('baseAmount')
    .notEmpty()
    .withMessage('baseAmount is required')
    .isFloat({ gt: 0 })
    .withMessage('baseAmount must be greater than 0'),
  validatorMiddleware,
];

exports.getOrderStatusValidator = [
  check('id').notEmpty().withMessage('order id is required'),
  validatorMiddleware,
];

