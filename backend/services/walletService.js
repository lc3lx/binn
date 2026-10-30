const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');
const Notification = require('../models/notificationModel');
const {
  distributeReferralCommissionsOnMiningProfit,
} = require('./referralService');

const calculateNewBalance = (currentBalance, type, amount) => {
  if (type === 'withdraw') return currentBalance - amount;
  return currentBalance + amount;
};

exports.getMyWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('walletBalance');

  res.status(200).json({
    status: 'Success',
    data: {
      balance: (user && user.walletBalance) || 0,
      currency: 'USD',
    },
  });
});

exports.getMyTransactions = asyncHandler(async (req, res) => {
  const transactions = await WalletTransaction.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('createdBy', 'name email role');

  res.status(200).json({
    results: transactions.length,
    data: transactions,
  });
});

exports.createUserTransactionByAdmin = asyncHandler(async (req, res, next) => {
  const { type, amount, note } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.userId}`, 404));
  }

  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = calculateNewBalance(balanceBefore, type, amount);

  if (type === 'withdraw' && balanceAfter < 0) {
    return next(new ApiError('Insufficient wallet balance for withdrawal', 400));
  }

  user.walletBalance = balanceAfter;
  await user.save();

  const transaction = await WalletTransaction.create({
    user: user._id,
    type,
    status: type === 'deposit' ? 'confirmed' : 'completed',
    amount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note,
    createdBy: req.user._id,
  });

  if (type === 'mining_profit') {
    try {
      await distributeReferralCommissionsOnMiningProfit({
        refereeId: user._id,
        profitAmount: amount,
        miningTransactionId: transaction._id,
      });
    } catch (err) {
      user.walletBalance = balanceBefore;
      await user.save({ validateBeforeSave: false });
      await WalletTransaction.findByIdAndDelete(transaction._id);
      return next(
        new ApiError(
          err.message
            ? `Mining profit saved failed after referral error: ${err.message}`
            : 'Referral commission distribution failed; mining profit was not applied',
          500
        )
      );
    }
  }

  res.status(201).json({
    status: 'Success',
    message: 'Wallet transaction created successfully',
    data: transaction,
  });
});

exports.requestDeposit = asyncHandler(async (req, res, next) => {
  const { amount, walletAddress, txHash, note } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const cleanTxHash = txHash ? txHash.trim() : '';

  // 1. Anti-Replay: Check if txHash has already been submitted or credited
  if (cleanTxHash) {
    const duplicateTx = await WalletTransaction.findOne({
      txHash: cleanTxHash,
      status: { $in: ['pending', 'confirmed', 'completed'] },
    });
    if (duplicateTx) {
      return next(
        new ApiError(
          'هاش المعاملة هذا تم تقديمه أو قيده مسبقاً / This transaction hash has already been submitted or credited',
          400
        )
      );
    }

    const PaymentOrder = require('../models/paymentOrderModel');
    const duplicatePaymentOrder = await PaymentOrder.findOne({
      txHash: cleanTxHash,
      status: 'paid',
    });
    if (duplicatePaymentOrder) {
      return next(
        new ApiError(
          'هاش المعاملة هذا تم استخدامه وقيد رصيده بالفعل / This transaction hash was already credited',
          400
        )
      );
    }

    // 2. Automated On-Chain Verification attempt
    try {
      const { verifyBep20TransactionReceipt, USDT_BEP20_CONTRACT } = require('../utils/bscClient');
      const contractAddress = process.env.BEP20_USDT_CONTRACT || USDT_BEP20_CONTRACT;
      const verification = await verifyBep20TransactionReceipt({
        txHash: cleanTxHash,
        contractAddress,
      });

      if (verification && verification.verified && verification.amount > 0) {
        const balanceBefore = user.walletBalance || 0;
        const creditAmt = Number(verification.amount.toFixed(2));
        const balanceAfter = Number((balanceBefore + creditAmt).toFixed(2));
        user.walletBalance = balanceAfter;
        await user.save();

        const transaction = await WalletTransaction.create({
          user: user._id,
          type: 'deposit',
          status: 'confirmed',
          amount: creditAmt,
          currency: 'USD',
          balanceBefore,
          balanceAfter,
          walletAddress: verification.to || walletAddress,
          txHash: cleanTxHash,
          note: `Auto verified BEP20 USDT deposit`,
          createdBy: user._id,
        });

        return res.status(201).json({
          status: 'Success',
          message: `تم التحقق من المعاملة عبر البلوكتشين بنجاح وإيداع ${creditAmt} USDT في محفظتك فوراً!`,
          data: transaction,
        });
      }
    } catch (err) {
      // Gracefully fall back to manual pending review
    }
  }

  const balance = user.walletBalance || 0;
  const transaction = await WalletTransaction.create({
    user: user._id,
    type: 'deposit',
    status: 'pending',
    amount: Number(amount),
    currency: 'USD',
    balanceBefore: balance,
    balanceAfter: balance,
    walletAddress,
    txHash: cleanTxHash,
    note: note || 'طلب إيداع يدوي عبر BEP-20',
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'Success',
    message: 'تم تقديم طلب الإيداع بنجاح، جاري التحقق من المعاملة وتأكيدها / Deposit submitted successfully and pending confirmation',
    data: transaction,
  });
});

exports.requestWithdraw = asyncHandler(async (req, res, next) => {
  // Check Weekend Rule: Saturday (6) and Sunday (0) are holidays (no withdrawals)
  const currentDay = new Date().getUTCDay(); // 0: Sunday, 6: Saturday
  if (currentDay === 0 || currentDay === 6) {
    return next(
      new ApiError(
        'طلبات السحب غير متاحة خلال عطلة نهاية الأسبوع (السبت والأحد). يمكنك تقديم طلب السحب من الإثنين إلى الجمعة. / Withdrawals are closed on weekends (Saturday & Sunday). Submissions are open Monday to Friday.',
        400
      )
    );
  }

  const { amount, walletAddress, withdrawalFee = 0, note } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const withdrawAmount = Number(amount);
  if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
    return next(new ApiError('مبلغ السحب غير صالح / Invalid withdrawal amount', 400));
  }

  if (withdrawAmount < 2.5) {
    return next(new ApiError('الحد الأدنى للسحب هو 2.50 USDT / Minimum withdrawal amount is 2.50 USDT', 400));
  }

  const cleanAddress = String(walletAddress || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
    return next(
      new ApiError(
        'عنوان المحفظة غير صالح. يجب أن يكون عنوان BEP-20 صحيح يبدأ بـ 0x / Invalid BEP-20 wallet address. Must start with 0x and be 42 characters long',
        400
      )
    );
  }

  // Security Check: Ensure sufficient balance
  const currentBalance = Number(user.walletBalance || 0);
  if (currentBalance < withdrawAmount) {
    return next(
      new ApiError('رصيد المحفظة غير كافٍ لإتمام طلب السحب / Insufficient wallet balance for withdrawal', 400)
    );
  }

  const fee = Math.max(0, Number(withdrawalFee) || 0.5);
  const netAmount = Math.max(0, Number((withdrawAmount - fee).toFixed(2)));

  // Critical Security: Deduct balance immediately upon request to prevent race conditions / double-spending
  const balanceBefore = currentBalance;
  const balanceAfter = Number((balanceBefore - withdrawAmount).toFixed(2));
  user.walletBalance = balanceAfter;
  await user.save();

  const transaction = await WalletTransaction.create({
    user: user._id,
    type: 'withdraw',
    status: 'pending',
    amount: withdrawAmount,
    withdrawalFee: fee,
    netAmount,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    walletAddress: cleanAddress,
    note: note || 'طلب سحب أرباح BEP-20',
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'Success',
    message:
      'تم تقديم طلب السحب وخصم المبلغ من محفظتك بنجاح، ستتم المراجعة والتحويل لمحفظتك خلال 48 ساعة كحد أقصى / Withdrawal request submitted successfully and will be processed within 48 hours',
    data: transaction,
  });
});

exports.reviewWithdrawByAdmin = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const transaction = await WalletTransaction.findById(req.params.transactionId);

  if (!transaction) {
    return next(new ApiError('Withdrawal transaction not found', 404));
  }
  if (transaction.type !== 'withdraw') {
    return next(new ApiError('This transaction is not a withdrawal', 400));
  }
  if (transaction.status !== 'pending') {
    return next(
      new ApiError('Only pending withdrawal can be approved/rejected', 400)
    );
  }

  const user = await User.findById(transaction.user);
  if (!user) {
    return next(new ApiError('User not found for this withdrawal', 404));
  }

  if (status === 'rejected') {
    // Refund amount back to user's wallet
    const balanceBeforeRefund = user.walletBalance || 0;
    const balanceAfterRefund = Number((balanceBeforeRefund + transaction.amount).toFixed(2));
    user.walletBalance = balanceAfterRefund;
    await user.save();

    transaction.status = 'rejected';
    transaction.rejectionReason = rejectionReason;
    transaction.balanceAfter = balanceAfterRefund;
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = Date.now();
    await transaction.save();

    return res.status(200).json({
      status: 'Success',
      message: 'Withdrawal request rejected and funds refunded to user wallet',
      data: transaction,
    });
  }

  // If approved: Funds were already safely deducted upfront upon request
  transaction.status = 'approved';
  transaction.approvedBy = req.user._id;
  transaction.approvedAt = Date.now();
  transaction.rejectionReason = undefined;
  await transaction.save();

  res.status(200).json({
    status: 'Success',
    message: 'Withdrawal request approved successfully',
    data: transaction,
  });
});

exports.markWithdrawPaidByAdmin = asyncHandler(async (req, res, next) => {
  const transaction = await WalletTransaction.findById(req.params.transactionId);

  if (!transaction) {
    return next(new ApiError('Withdrawal transaction not found', 404));
  }
  if (transaction.type !== 'withdraw') {
    return next(new ApiError('This transaction is not a withdrawal', 400));
  }
  if (transaction.status !== 'approved') {
    return next(new ApiError('Only approved withdrawal can be marked paid', 400));
  }

  transaction.status = 'paid';
  transaction.paidBy = req.user._id;
  transaction.paidAt = Date.now();
  await transaction.save();

  res.status(200).json({
    status: 'Success',
    message: 'Withdrawal marked as paid',
    data: transaction,
  });
});

exports.notifyUserWithdrawPaid = asyncHandler(async (req, res, next) => {
  const transaction = await WalletTransaction.findById(req.params.transactionId);
  if (!transaction) {
    return next(new ApiError('Withdrawal transaction not found', 404));
  }
  if (transaction.type !== 'withdraw') {
    return next(new ApiError('This transaction is not a withdrawal', 400));
  }
  if (transaction.status !== 'paid') {
    return next(
      new ApiError('Withdrawal must be paid before sending notification', 400)
    );
  }
  if (transaction.notificationSentAt) {
    return next(new ApiError('User already notified for this withdrawal', 400));
  }

  const notification = await Notification.create({
    user: transaction.user,
    title: 'Withdrawal Completed',
    message:
      req.body.message ||
      `Your withdrawal of ${transaction.amount} USD has been paid successfully.`,
    type: 'withdrawal',
  });

  transaction.notificationSentAt = Date.now();
  transaction.notificationId = notification._id;
  await transaction.save();

  res.status(201).json({
    status: 'Success',
    message: 'Notification sent to user',
    data: notification,
  });
});

exports.getUserTransactionsByAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('_id');
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.userId}`, 404));
  }

  const transactions = await WalletTransaction.find({ user: req.params.userId })
    .sort('-createdAt')
    .populate('createdBy', 'name email role');

  res.status(200).json({
    results: transactions.length,
    data: transactions,
  });
});

exports.getAdminDepositsManagement = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const status = req.query.status ? String(req.query.status).toLowerCase() : 'all';

  const filter = { type: 'deposit' };
  if (status !== 'all') filter.status = status;

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    filter.user = { $in: users.map((u) => u._id) };
  }

  const transactions = await WalletTransaction.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email phone')
    .populate('approvedBy', 'name email role');

  const total = await WalletTransaction.countDocuments(filter);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const [confirmedTotalAgg, pendingCount, todayVolumeAgg] = await Promise.all([
    WalletTransaction.aggregate([
      { $match: { type: 'deposit', status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    WalletTransaction.countDocuments({ type: 'deposit', status: 'pending' }),
    WalletTransaction.aggregate([
      {
        $match: {
          type: 'deposit',
          status: { $in: ['pending', 'confirmed'] },
          createdAt: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const confirmedTotal =
    confirmedTotalAgg && confirmedTotalAgg.length ? confirmedTotalAgg[0].total : 0;
  const todayVolume =
    todayVolumeAgg && todayVolumeAgg.length ? todayVolumeAgg[0].total : 0;

  const data = transactions.map((t) => ({
    transactionId: t._id,
    transactionCode: `DEP-${String(t._id).slice(-6).toUpperCase()}`,
    user: t.user,
    amount: t.amount,
    walletAddress: t.walletAddress || '',
    txHash: t.txHash || '',
    status: t.status,
    date: t.createdAt,
    note: t.note,
  }));

  res.status(200).json({
    status: 'Success',
    counters: {
      totalConfirmed: confirmedTotal,
      pendingReview: pendingCount,
      todayVolume,
      currency: 'USD',
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    results: data.length,
    data,
  });
});

exports.reviewDepositByAdmin = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const transaction = await WalletTransaction.findById(req.params.transactionId);

  if (!transaction) {
    return next(new ApiError('Deposit transaction not found', 404));
  }
  if (transaction.type !== 'deposit') {
    return next(new ApiError('This transaction is not a deposit', 400));
  }
  if (transaction.status !== 'pending') {
    return next(new ApiError('Only pending deposit can be reviewed', 400));
  }

  if (status === 'rejected') {
    transaction.status = 'rejected';
    transaction.rejectionReason = rejectionReason;
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = Date.now();
    await transaction.save();

    return res.status(200).json({
      status: 'Success',
      message: 'Deposit rejected successfully',
      data: transaction,
    });
  }

  const user = await User.findById(transaction.user);
  if (!user) {
    return next(new ApiError('User not found for this deposit', 404));
  }

  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = balanceBefore + transaction.amount;
  user.walletBalance = balanceAfter;
  await user.save();

  transaction.status = 'confirmed';
  transaction.balanceBefore = balanceBefore;
  transaction.balanceAfter = balanceAfter;
  transaction.approvedBy = req.user._id;
  transaction.approvedAt = Date.now();
  transaction.rejectionReason = undefined;
  await transaction.save();

  res.status(200).json({
    status: 'Success',
    message: 'Deposit confirmed successfully',
    data: transaction,
  });
});

exports.getAdminWithdrawalsManagement = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const status = req.query.status ? String(req.query.status).toLowerCase() : 'all';

  const filter = { type: 'withdraw' };
  if (status !== 'all') filter.status = status;

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    filter.user = { $in: users.map((u) => u._id) };
  }

  const transactions = await WalletTransaction.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email phone')
    .populate('approvedBy', 'name email role');

  const total = await WalletTransaction.countDocuments(filter);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const [pendingAmountAgg, pendingRequests, todayPaidOutAgg] = await Promise.all([
    WalletTransaction.aggregate([
      { $match: { type: 'withdraw', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    WalletTransaction.countDocuments({ type: 'withdraw', status: 'pending' }),
    WalletTransaction.aggregate([
      {
        $match: {
          type: 'withdraw',
          status: 'paid',
          createdAt: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } },
    ]),
  ]);

  const pendingAmount =
    pendingAmountAgg && pendingAmountAgg.length ? pendingAmountAgg[0].total : 0;
  const todayPaidOut =
    todayPaidOutAgg && todayPaidOutAgg.length ? todayPaidOutAgg[0].total : 0;

  const data = transactions.map((t) => ({
    transactionId: t._id,
    requestCode: `WD-${String(t._id).slice(-6).toUpperCase()}`,
    user: t.user,
    walletAddress: t.walletAddress || '',
    amount: t.amount,
    fee: t.withdrawalFee || 0,
    netAmount:
      typeof t.netAmount === 'number' ? t.netAmount : t.amount - (t.withdrawalFee || 0),
    status: t.status,
    date: t.createdAt,
    isNotified: Boolean(t.notificationSentAt),
    note: t.note,
  }));

  res.status(200).json({
    status: 'Success',
    counters: {
      pendingAmount,
      pendingRequests,
      todayPaidOut,
      currency: 'USD',
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    results: data.length,
    data,
  });
});

exports.getAdminTransactionsManagement = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const type = req.query.type ? String(req.query.type).toLowerCase() : 'all';
  const status = req.query.status ? String(req.query.status).toLowerCase() : 'all';

  const filter = {};
  if (type !== 'all') {
    filter.type = type;
  }
  if (status !== 'all') {
    filter.status = status;
  }

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    filter.user = { $in: users.map((u) => u._id) };
  }

  const transactions = await WalletTransaction.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email phone')
    .populate('createdBy', 'name email role');

  const total = await WalletTransaction.countDocuments(filter);

  const pendingWithdrawalsCount = await WalletTransaction.countDocuments({
    type: 'withdraw',
    status: 'pending',
  });

  const typeCountersAgg = await WalletTransaction.aggregate([
    { $match: {} },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const statusCountersAgg = await WalletTransaction.aggregate([
    { $match: {} },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const typeCounters = {
    all: 0,
    deposit: 0,
    withdraw: 0,
    mining_profit: 0,
    plan_purchase: 0,
    referral_commission: 0,
  };
  for (let i = 0; i < typeCountersAgg.length; i += 1) {
    const row = typeCountersAgg[i];
    typeCounters[row._id] = row.count;
    typeCounters.all += row.count;
  }

  const statusCounters = {
    all: 0,
    confirmed: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
    completed: 0,
  };
  for (let i = 0; i < statusCountersAgg.length; i += 1) {
    const row = statusCountersAgg[i];
    statusCounters[row._id] = row.count;
    statusCounters.all += row.count;
  }

  const data = transactions.map((t) => ({
    transactionId: t._id,
    transactionCode: `TXN-${String(t._id).slice(-6).toUpperCase()}`,
    user: t.user,
    type: t.type,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    status: t.status,
    date: t.createdAt,
    note: t.note,
  }));

  res.status(200).json({
    status: 'Success',
    headline: {
      pendingWithdrawalRequests: pendingWithdrawalsCount,
    },
    counters: {
      types: typeCounters,
      statuses: statusCounters,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    results: data.length,
    data,
  });
});
