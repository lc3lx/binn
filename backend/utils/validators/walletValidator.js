const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createWalletTransactionValidator = [
  check('userId').isMongoId().withMessage('Invalid user id format'),
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['deposit', 'withdraw', 'mining_profit', 'plan_purchase'])
    .withMessage(
      'Transaction type must be deposit, withdraw, mining_profit or plan_purchase'
    ),
  body('amount')
    .notEmpty()
    .withMessage('Transaction amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Transaction amount must be greater than 0'),
  body('note').optional().isString().withMessage('note must be a string'),
  validatorMiddleware,
];

exports.getUserWalletTransactionsValidator = [
  check('userId').isMongoId().withMessage('Invalid user id format'),
  validatorMiddleware,
];

exports.requestWithdrawValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Withdrawal amount is required')
    .isFloat({ min: 2.5 })
    .withMessage('Minimum withdrawal amount is 2.50 USDT'),
  body('walletAddress')
    .notEmpty()
    .withMessage('walletAddress is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid BEP-20 wallet address. Must start with 0x and be 42 characters long'),
  body('withdrawalFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('withdrawalFee must be >= 0'),
  body('note').optional().isString().withMessage('note must be a string'),
  validatorMiddleware,
];

exports.reviewWithdrawValidator = [
  check('transactionId').isMongoId().withMessage('Invalid transaction id format'),
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('status must be approved or rejected'),
  body('rejectionReason').custom((val, { req }) => {
    if (req.body.status === 'rejected' && !val) {
      throw new Error('rejectionReason is required when rejecting withdrawal');
    }
    return true;
  }),
  validatorMiddleware,
];

exports.markWithdrawPaidValidator = [
  check('transactionId').isMongoId().withMessage('Invalid transaction id format'),
  validatorMiddleware,
];

exports.notifyWithdrawPaidValidator = [
  check('transactionId').isMongoId().withMessage('Invalid transaction id format'),
  body('message').optional().isString().withMessage('message must be a string'),
  validatorMiddleware,
];

exports.requestDepositValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Deposit amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Deposit amount must be greater than 0'),
  body('walletAddress')
    .notEmpty()
    .withMessage('walletAddress is required')
    .isString()
    .withMessage('walletAddress must be a string'),
  body('txHash')
    .notEmpty()
    .withMessage('txHash is required')
    .isString()
    .withMessage('txHash must be a string'),
  body('note').optional().isString().withMessage('note must be a string'),
  validatorMiddleware,
];

exports.adminDepositsQueryValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  check('status')
    .optional()
    .isIn(['all', 'confirmed', 'pending', 'rejected'])
    .withMessage('status must be all, confirmed, pending or rejected'),
  validatorMiddleware,
];

exports.reviewDepositValidator = [
  check('transactionId').isMongoId().withMessage('Invalid transaction id format'),
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(['confirmed', 'rejected'])
    .withMessage('status must be confirmed or rejected'),
  body('rejectionReason').custom((val, { req }) => {
    if (req.body.status === 'rejected' && !val) {
      throw new Error('rejectionReason is required when rejecting deposit');
    }
    return true;
  }),
  validatorMiddleware,
];

exports.adminWithdrawalsQueryValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  check('status')
    .optional()
    .isIn(['all', 'paid', 'pending', 'approved', 'rejected'])
    .withMessage('status must be all, paid, pending, approved or rejected'),
  validatorMiddleware,
];

exports.adminTransactionsQueryValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  check('type')
    .optional()
    .isIn([
      'all',
      'deposit',
      'withdraw',
      'mining_profit',
      'plan_purchase',
      'referral_commission',
    ])
    .withMessage(
      'type must be all, deposit, withdraw, mining_profit, plan_purchase or referral_commission'
    ),
  check('status')
    .optional()
    .isIn([
      'all',
      'confirmed',
      'pending',
      'approved',
      'rejected',
      'paid',
      'completed',
    ])
    .withMessage(
      'status must be all, confirmed, pending, approved, rejected, paid or completed'
    ),
  validatorMiddleware,
];
