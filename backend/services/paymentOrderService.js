const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const PaymentOrder = require('../models/paymentOrderModel');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
const PlatformSetting = require('../models/platformSettingModel');
const {
  getBep20UsdtTransactionsByAddress,
  verifyBep20TransactionReceipt,
  USDT_BEP20_CONTRACT,
} = require('../utils/bscClient');

const DEFAULT_EXPIRE_MINUTES = 15;
const DEFAULT_TOLERANCE = 0.000001;
const USDT_DECIMALS = 6;

let nextAddressIndex = 0;

const getDepositAddresses = async () => {
  try {
    const settings = await PlatformSetting.findOne({}).select(
      'bep20DepositWalletAddress trc20DepositWalletAddress'
    );
    if (
      settings &&
      settings.bep20DepositWalletAddress &&
      settings.bep20DepositWalletAddress.trim()
    ) {
      return [settings.bep20DepositWalletAddress.trim()];
    }
  } catch (e) {
    // ignore db error, proceed to env
  }

  const fromEnv =
    process.env.BEP20_DEPOSIT_ADDRESSES ||
    process.env.TRC20_DEPOSIT_ADDRESSES ||
    '';

  const parsed = fromEnv
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  if (parsed.length > 0) return parsed;
  return ['0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19'];
};

const getExpireMinutes = () => {
  const n = Number(process.env.PAYMENT_ORDER_EXPIRE_MINUTES);
  if (!n || n <= 0) return DEFAULT_EXPIRE_MINUTES;
  return n;
};

const getTolerance = () => {
  const n = Number(process.env.PAYMENT_AMOUNT_TOLERANCE);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_TOLERANCE;
  return n;
};

const roundToUsdt = (value) => Number(Number(value).toFixed(USDT_DECIMALS));

const generateMicroAmount = () => {
  const randomInt = Math.floor(Math.random() * 999999) + 1; // 1..999999
  return roundToUsdt(randomInt / 10 ** USDT_DECIMALS);
};

const pickAddressRoundRobin = (addresses) => {
  const idx = nextAddressIndex % addresses.length;
  nextAddressIndex += 1;
  return addresses[idx];
};

const createOrderId = () => `ORD-${uuidv4().replace(/-/g, '').toUpperCase()}`;

const isAdminLike = (role) => role === 'admin' || role === 'manager';

const findReusablePending = async ({ address, expectedAmount }) => {
  const now = new Date();
  const existing = await PaymentOrder.findOne({
    address: address.toLowerCase(),
    expectedAmount,
    status: 'pending',
    expiresAt: { $gt: now },
  }).select('_id');
  return existing;
};

const createUniqueExpectedAmount = async ({ baseAmount, address }) => {
  for (let i = 0; i < 30; i += 1) {
    const microAmount = generateMicroAmount();
    const expectedAmount = roundToUsdt(baseAmount + microAmount);
    // eslint-disable-next-line no-await-in-loop
    const existing = await findReusablePending({ address, expectedAmount });
    if (!existing) {
      return { microAmount, expectedAmount };
    }
  }
  throw new ApiError('Unable to generate unique payment amount, retry please', 500);
};

const chooseBestCandidate = (candidates, expectedAmount, tolerance) => {
  let exact = null;
  let mismatch = null;
  let mismatchDiff = Number.MAX_VALUE;

  for (let i = 0; i < candidates.length; i += 1) {
    const tx = candidates[i];
    const diff = Math.abs(tx.amount - expectedAmount);
    if (diff <= tolerance) {
      exact = tx;
      break;
    }
    if (diff < mismatchDiff) {
      mismatch = tx;
      mismatchDiff = diff;
    }
  }

  return { exact, mismatch };
};

const resolveCreditAmount = (order) => {
  const raw = Number(order.paidAmount || order.expectedAmount || order.baseAmount);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return roundToUsdt(raw);
};

const syncOrderCreditMetadata = async ({ orderId, now }) => {
  const order = await PaymentOrder.findById(orderId);
  if (!order) return;

  const existingTx = await WalletTransaction.findOne({
    relatedPaymentOrder: order._id,
  }).select('_id amount');

  if (!existingTx) return;

  order.creditedAmount = Number(existingTx.amount) || resolveCreditAmount(order);
  order.creditedAt = order.creditedAt || now;
  order.creditedTransaction = existingTx._id;
  await order.save({ validateBeforeSave: false });
};

const creditPaidOrderInTransaction = async ({ orderId, now }) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await PaymentOrder.findById(orderId).session(session);
    if (!order || order.status !== 'paid' || !order.user) {
      await session.abortTransaction();
      return;
    }

    const amountToCredit = resolveCreditAmount(order);
    if (!amountToCredit) {
      await session.abortTransaction();
      return;
    }

    const existingTx = await WalletTransaction.findOne({
      relatedPaymentOrder: order._id,
    })
      .session(session)
      .select('_id amount');

    if (existingTx) {
      order.creditedAmount = Number(existingTx.amount) || amountToCredit;
      order.creditedAt = order.creditedAt || now;
      order.creditedTransaction = existingTx._id;
      await order.save({ session, validateBeforeSave: false });
      await session.commitTransaction();
      return;
    }

    const user = await User.findById(order.user).session(session).select('walletBalance');
    if (!user) {
      throw new Error(`User not found for payment order ${order.orderId}`);
    }

    const balanceBefore = Number(user.walletBalance) || 0;
    const balanceAfter = roundToUsdt(balanceBefore + amountToCredit);
    user.walletBalance = balanceAfter;
    await user.save({ session, validateBeforeSave: false });

    const transactions = await WalletTransaction.create(
      [
        {
          user: user._id,
          type: 'deposit',
          status: 'confirmed',
          amount: amountToCredit,
          currency: 'USD',
          balanceBefore,
          balanceAfter,
          walletAddress: order.address,
          txHash: order.txHash,
          note: `Auto confirmed BEP20 USDT deposit for order ${order.orderId}`,
          createdBy: user._id,
          relatedPaymentOrder: order._id,
        },
      ],
      { session }
    );

    order.creditedAmount = amountToCredit;
    order.creditedAt = now;
    order.creditedTransaction = transactions[0]._id;
    await order.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const creditPaidOrderFallback = async ({ orderId, now }) => {
  const order = await PaymentOrder.findById(orderId);
  if (!order || order.status !== 'paid' || !order.user) return;

  const amountToCredit = resolveCreditAmount(order);
  if (!amountToCredit) return;

  let existingTx = await WalletTransaction.findOne({
    relatedPaymentOrder: order._id,
  }).select('_id amount');

  if (!existingTx) {
    const user = await User.findById(order.user).select('walletBalance');
    if (!user) {
      throw new Error(`User not found for payment order ${order.orderId}`);
    }

    const balanceBefore = Number(user.walletBalance) || 0;
    const balanceAfter = roundToUsdt(balanceBefore + amountToCredit);
    user.walletBalance = balanceAfter;
    await user.save({ validateBeforeSave: false });

    try {
      existingTx = await WalletTransaction.create({
        user: user._id,
        type: 'deposit',
        status: 'confirmed',
        amount: amountToCredit,
        currency: 'USD',
        balanceBefore,
        balanceAfter,
        walletAddress: order.address,
        txHash: order.txHash,
        note: `Auto confirmed BEP20 USDT deposit for order ${order.orderId}`,
        createdBy: user._id,
        relatedPaymentOrder: order._id,
      });
    } catch (err) {
      if (err && err.code === 11000) {
        existingTx = await WalletTransaction.findOne({
          relatedPaymentOrder: order._id,
        }).select('_id amount');
      } else {
        throw err;
      }
    }
  }

  if (!existingTx) return;

  order.creditedAmount = Number(existingTx.amount) || amountToCredit;
  order.creditedAt = order.creditedAt || now;
  order.creditedTransaction = existingTx._id;
  await order.save({ validateBeforeSave: false });
};

const isTransactionUnsupportedError = (err) => {
  if (!err || !err.message) return false;
  return (
    err.message.includes('Transaction numbers are only allowed') ||
    err.message.includes('Transaction support is not enabled')
  );
};

const creditPaidOrder = async ({ orderId, now }) => {
  try {
    await creditPaidOrderInTransaction({ orderId, now });
  } catch (err) {
    if (err && err.code === 11000) {
      await syncOrderCreditMetadata({ orderId, now });
      return;
    }
    if (isTransactionUnsupportedError(err)) {
      await creditPaidOrderFallback({ orderId, now });
      return;
    }
    throw err;
  }
};

exports.createOrder = asyncHandler(async (req, res, next) => {
  const baseAmount = roundToUsdt(req.body.baseAmount);
  if (!baseAmount || baseAmount <= 0) {
    return next(new ApiError('Invalid baseAmount', 400));
  }

  const addresses = await getDepositAddresses();
  if (!addresses.length) {
    return next(new ApiError('BEP20 deposit addresses are not configured', 500));
  }

  const rawAddress = pickAddressRoundRobin(addresses);
  const address = rawAddress.trim().toLowerCase();
  const unique = await createUniqueExpectedAmount({ baseAmount, address });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + getExpireMinutes() * 60 * 1000);

  const order = await PaymentOrder.create({
    user: req.user._id,
    orderId: createOrderId(),
    network: 'BEP20',
    tokenSymbol: 'USDT',
    address,
    baseAmount,
    microAmount: unique.microAmount,
    expectedAmount: unique.expectedAmount,
    status: 'pending',
    createdAt: now,
    expiresAt,
  });

  res.status(201).json({
    status: 'Success',
    data: {
      order_id: order.orderId,
      network: order.network,
      token_symbol: order.tokenSymbol,
      address: order.address,
      base_amount: order.baseAmount,
      micro_amount: order.microAmount,
      expected_amount: order.expectedAmount,
      status: order.status,
      created_at: order.createdAt,
      expires_at: order.expiresAt,
    },
  });
});

exports.getOrderStatus = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const or = [{ orderId: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    or.push({ _id: id });
  }

  const filter = { $or: or };
  if (!isAdminLike(req.user.role)) {
    filter.user = req.user._id;
  }

  const order = await PaymentOrder.findOne(filter);
  if (!order) return next(new ApiError('Order not found', 404));

  res.status(200).json({
    status: 'Success',
    data: {
      order_id: order.orderId,
      network: order.network || 'BEP20',
      token_symbol: order.tokenSymbol || 'USDT',
      address: order.address,
      base_amount: order.baseAmount,
      micro_amount: order.microAmount,
      expected_amount: order.expectedAmount,
      status: order.status,
      tx_hash: order.txHash || null,
      paid_amount: order.paidAmount || null,
      mismatch_type: order.mismatchType,
      mismatch_amount: order.mismatchAmount || null,
      credited_amount: order.creditedAmount || null,
      credited_at: order.creditedAt || null,
      credited_transaction_id: order.creditedTransaction || null,
      created_at: order.createdAt,
      expires_at: order.expiresAt,
      paid_at: order.paidAt || null,
      last_checked_at: order.lastCheckedAt || null,
    },
  });
});

/**
 * Submit or instant-verify TX Hash on-chain
 */
exports.submitTxHash = asyncHandler(async (req, res, next) => {
  const { orderId, txHash } = req.body;
  if (!orderId || !txHash) {
    return next(new ApiError('orderId and txHash are required', 400));
  }

  const cleanTxHash = txHash.trim();
  const or = [{ orderId }];
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    or.push({ _id: orderId });
  }

  const order = await PaymentOrder.findOne({
    $or: or,
    user: req.user._id,
  });

  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  if (order.status === 'paid') {
    return res.status(200).json({
      status: 'Success',
      message: 'Order is already marked as paid and credited',
      data: order,
    });
  }

  // Idempotency check: Ensure txHash is not used on another paid order
  const existingTx = await PaymentOrder.findOne({
    txHash: cleanTxHash,
    _id: { $ne: order._id },
    status: 'paid',
  });
  if (existingTx) {
    return next(new ApiError('This transaction hash has already been credited to another order', 400));
  }

  const contractAddress = process.env.BEP20_USDT_CONTRACT || USDT_BEP20_CONTRACT;
  const verification = await verifyBep20TransactionReceipt({
    txHash: cleanTxHash,
    expectedTo: order.address,
    contractAddress,
  });

  if (!verification.verified) {
    return next(
      new ApiError(
        verification.reason || 'Transaction could not be verified on BSC blockchain',
        400
      )
    );
  }

  const tolerance = getTolerance();
  const diff = Math.abs(verification.amount - order.expectedAmount);
  const now = new Date();

  order.txHash = verification.txHash;
  order.paidAmount = verification.amount;
  order.paidAt = now;
  order.lastCheckedAt = now;

  if (diff <= tolerance || verification.amount >= order.baseAmount) {
    order.status = 'paid';
    order.mismatchType = 'none';
    order.mismatchAmount = undefined;
    await order.save({ validateBeforeSave: false });
    await creditPaidOrder({ orderId: order._id, now });

    return res.status(200).json({
      status: 'Success',
      message: 'Transaction verified and wallet credited successfully!',
      data: order,
    });
  }

  order.mismatchType = verification.amount < order.expectedAmount ? 'underpaid' : 'overpaid';
  order.mismatchAmount = roundToUsdt(Math.abs(diff));
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'Success',
    message: 'Payment detected with amount mismatch, awaiting review',
    data: order,
  });
});

/**
 * Background worker cycle to auto-detect pending BEP20 USDT deposits
 */
exports.processPendingOrders = async () => {
  const now = new Date();
  const tolerance = getTolerance();
  const contractAddress = process.env.BEP20_USDT_CONTRACT || USDT_BEP20_CONTRACT;

  // Expire old orders first.
  await PaymentOrder.updateMany(
    { status: 'pending', expiresAt: { $lte: now } },
    { status: 'expired', lastCheckedAt: now }
  );

  const pendingOrders = await PaymentOrder.find({
    status: 'pending',
    expiresAt: { $gt: now },
  })
    .sort('createdAt')
    .limit(200);

  if (!pendingOrders.length) return;

  // Group pending orders by deposit address
  const ordersByAddress = {};
  for (let i = 0; i < pendingOrders.length; i += 1) {
    const o = pendingOrders[i];
    const key = String(o.address || '').trim().toLowerCase();
    if (!ordersByAddress[key]) ordersByAddress[key] = [];
    ordersByAddress[key].push(o);
  }

  const addresses = Object.keys(ordersByAddress);
  for (let i = 0; i < addresses.length; i += 1) {
    const addr = addresses[i];
    const addrOrders = ordersByAddress[addr];

    try {
      // eslint-disable-next-line no-await-in-loop
      const txs = await getBep20UsdtTransactionsByAddress({
        address: addr,
        contractAddress,
        blockLookback: 500, // ~25 minutes on BSC
      });

      if (!txs || txs.length === 0) continue;

      for (let j = 0; j < addrOrders.length; j += 1) {
        const order = addrOrders[j];
        const candidates = txs.filter((tx) => {
          const txTime = Number(tx.timestamp || 0);
          return (
            tx.to === addr &&
            txTime >= new Date(order.createdAt).getTime() - 2 * 60 * 1000 &&
            txTime <= new Date(order.expiresAt).getTime() + 2 * 60 * 1000
          );
        });

        const picked = chooseBestCandidate(
          candidates,
          Number(order.expectedAmount),
          tolerance
        );

        if (picked.exact) {
          // eslint-disable-next-line no-await-in-loop
          const existingPaid = await PaymentOrder.findOne({
            txHash: picked.exact.txHash,
            status: 'paid',
            _id: { $ne: order._id },
          }).select('_id');

          if (existingPaid) {
            order.mismatchType = 'duplicate_payment';
            order.mismatchAmount = picked.exact.amount;
            order.lastCheckedAt = now;
            // eslint-disable-next-line no-await-in-loop
            await order.save();
            // eslint-disable-next-line no-continue
            continue;
          }

          order.status = 'paid';
          order.txHash = picked.exact.txHash;
          order.paidAmount = picked.exact.amount;
          order.paidAt = new Date(Number(picked.exact.timestamp || Date.now()));
          order.lastCheckedAt = now;
          order.mismatchType = 'none';
          order.mismatchAmount = undefined;
          // eslint-disable-next-line no-await-in-loop
          await order.save();
          // eslint-disable-next-line no-await-in-loop
          await creditPaidOrder({ orderId: order._id, now });
          // eslint-disable-next-line no-console
          console.log(
            `[PaymentWorker] BSC Order ${order.orderId} auto-paid and credited with tx ${order.txHash}`
          );
        } else if (picked.mismatch) {
          order.lastCheckedAt = now;
          order.mismatchAmount = picked.mismatch.amount;
          order.mismatchType =
            picked.mismatch.amount < order.expectedAmount
              ? 'underpaid'
              : 'overpaid';
          // eslint-disable-next-line no-await-in-loop
          await order.save();
        } else {
          order.lastCheckedAt = now;
          // eslint-disable-next-line no-await-in-loop
          await order.save();
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[PaymentWorker] BSC error for address ${addr}: ${err.message}`
      );
    }
  }

  // Settle any uncredited paid orders
  const uncreditedPaidOrders = await PaymentOrder.find({
    status: 'paid',
    $or: [
      { creditedAt: { $exists: false } },
      { creditedAt: null },
      { creditedTransaction: { $exists: false } },
      { creditedTransaction: null },
    ],
  })
    .sort('paidAt')
    .limit(200)
    .select('_id orderId');

  for (let i = 0; i < uncreditedPaidOrders.length; i += 1) {
    const paidOrder = uncreditedPaidOrders[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      await creditPaidOrder({ orderId: paidOrder._id, now });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[PaymentWorker] Credit sync failed for order ${paidOrder.orderId}: ${err.message}`
      );
    }
  }
};
