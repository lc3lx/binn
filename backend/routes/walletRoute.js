const express = require('express');

const authService = require('../services/authService');
const {
  getMyWallet,
  getMyTransactions,
  createUserTransactionByAdmin,
  getUserTransactionsByAdmin,
  requestDeposit,
  getAdminDepositsManagement,
  reviewDepositByAdmin,
  getAdminWithdrawalsManagement,
  getAdminTransactionsManagement,
  requestWithdraw,
  reviewWithdrawByAdmin,
  markWithdrawPaidByAdmin,
  notifyUserWithdrawPaid,
} = require('../services/walletService');
const {
  createWalletTransactionValidator,
  getUserWalletTransactionsValidator,
  requestWithdrawValidator,
  requestDepositValidator,
  adminDepositsQueryValidator,
  adminWithdrawalsQueryValidator,
  adminTransactionsQueryValidator,
  reviewDepositValidator,
  reviewWithdrawValidator,
  markWithdrawPaidValidator,
  notifyWithdrawPaidValidator,
} = require('../utils/validators/walletValidator');

const router = express.Router();

router.use(authService.protect);

router.get('/me', getMyWallet);
router.get('/me/transactions', getMyTransactions);
router.post('/deposit/request', requestDepositValidator, requestDeposit);
router.post('/withdraw/request', requestWithdrawValidator, requestWithdraw);

router.use(authService.allowedTo('admin', 'manager'));

router.post(
  '/:userId([0-9a-fA-F]{24})/transactions',
  createWalletTransactionValidator,
  createUserTransactionByAdmin
);
router.get(
  '/:userId([0-9a-fA-F]{24})/transactions',
  getUserWalletTransactionsValidator,
  getUserTransactionsByAdmin
);
router.get('/admin/deposits', adminDepositsQueryValidator, getAdminDepositsManagement);
router.get(
  '/admin/withdrawals',
  adminWithdrawalsQueryValidator,
  getAdminWithdrawalsManagement
);
router.get(
  '/admin/transactions',
  adminTransactionsQueryValidator,
  getAdminTransactionsManagement
);
router.put(
  '/deposits/:transactionId/review',
  reviewDepositValidator,
  reviewDepositByAdmin
);
router.put(
  '/transactions/:transactionId/review',
  reviewWithdrawValidator,
  reviewWithdrawByAdmin
);
router.put(
  '/transactions/:transactionId/mark-paid',
  markWithdrawPaidValidator,
  markWithdrawPaidByAdmin
);
router.post(
  '/transactions/:transactionId/notify-user',
  notifyWithdrawPaidValidator,
  notifyUserWithdrawPaid
);

module.exports = router;
