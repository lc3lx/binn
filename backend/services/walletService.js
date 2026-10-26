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

  const balance = user.walletBalance || 0;
  const transaction = await WalletTransaction.create({
    user: user._id,
    type: 'deposit',
    status: 'pending',
    amount,
    currency: 'USD',
    balanceBefore: balance,
    balanceAfter: balance,
    walletAddress,
    txHash,
    note,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'Success',
    message: 'Deposit request submitted and waiting for admin confirmation',
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

  const pendingTxs = await WalletTransaction.find({
    user: user._id,
    type: 'withdraw',
    status: 'pending',
  }).select('amount');

  const pendingTotal = pendingTxs.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0
  );
  const availableBalance = (user.walletBalance || 0) - pendingTotal;

  if (availableBalance < amount) {
    return next(
      new ApiError(
        pendingTotal > 0
          ? `Insufficient available balance. You have $${pendingTotal.toFixed(2)} in pending withdrawals.`
          : 'Insufficient wallet balance for withdrawal',
        400
      )
    );
  }

  const fee = Number(withdrawalFee) || 0;
  const netAmount = Number(amount) - fee;
  if (netAmount < 0) {
    return next(new ApiError('withdrawalFee cannot be greater than amount', 400));
  }

  const transaction = await WalletTransaction.create({
    user: user._id,
    type: 'withdraw',
    status: 'pending',
    amount,
    withdrawalFee: fee,
    netAmount,
    currency: 'USD',
    balanceBefore: user.walletBalance || 0,
    balanceAfter: user.walletBalance || 0,
    walletAddress,
    note,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'Success',
    message: 'Withdrawal request submitted and waiting for admin review',
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

  if (status === 'rejected') {
    transaction.status = 'rejected';
    transaction.rejectionReason = rejectionReason;
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = Date.now();
    await transaction.save();

    return res.status(200).json({
      status: 'Success',
      message: 'Withdrawal request rejected',
      data: transaction,
    });
  }

  const user = await User.findById(transaction.user);
  if (!user) {
    return next(new ApiError('User not found for this withdrawal', 404));
  }
  if ((user.walletBalance || 0) < transaction.amount) {
    return next(new ApiError('Insufficient wallet balance for approval', 400));
  }

  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = balanceBefore - transaction.amount;
  user.walletBalance = balanceAfter;
  await user.save();

  transaction.status = 'approved';
  transaction.balanceBefore = balanceBefore;
  transaction.balanceAfter = balanceAfter;
  transaction.approvedBy = req.user._id;
  transaction.approvedAt = Date.now();
  transaction.rejectionReason = undefined;
  await transaction.save();

  res.status(200).json({
    status: 'Success',
    message: 'Withdrawal request approved',
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
