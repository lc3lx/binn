const express = require('express');

const {
  createOrder,
  getOrderStatus,
  submitTxHash,
} = require('../services/paymentOrderService');
const authService = require('../services/authService');
const {
  createOrderValidator,
  getOrderStatusValidator,
} = require('../utils/validators/paymentOrderValidator');

const router = express.Router();

router.use(authService.protect);

router.post('/create-order', createOrderValidator, createOrder);
router.get('/order-status/:id', getOrderStatusValidator, getOrderStatus);
router.post('/verify-tx', submitTxHash);

module.exports = router;
