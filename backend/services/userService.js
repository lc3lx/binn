const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const {
  uploadSingleImage,
  uploadMixOfImages,
} = require('../middlewares/uploadImageMiddleware');
const createToken = require('../utils/createToken');
const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');

const uploadsRootPath = path.join(__dirname, '..', 'uploads');
const usersUploadPath = path.join(uploadsRootPath, 'users');
const kycUploadPath = path.join(uploadsRootPath, 'kyc');

// Upload single image
exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    fs.mkdirSync(usersUploadPath, { recursive: true });

    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(path.join(usersUploadPath, filename));

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

exports.uploadKycImages = uploadMixOfImages([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
]);

exports.resizeKycImages = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.frontImage || !req.files.backImage) {
    return next(
      new ApiError('Both frontImage and backImage are required for KYC', 400)
    );
  }

  const fullName = req.body.fullName ? String(req.body.fullName).trim() : '';
  const nationalNumber = req.body.nationalNumber
    ? String(req.body.nationalNumber).trim()
    : '';

  if (!fullName || !nationalNumber) {
    return next(
      new ApiError('fullName and nationalNumber are required for KYC', 400)
    );
  }

  fs.mkdirSync(kycUploadPath, { recursive: true });

  const frontFilename = `kyc-front-${req.user._id}-${uuidv4()}-${Date.now()}.jpeg`;
  const backFilename = `kyc-back-${req.user._id}-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.files.frontImage[0].buffer)
    .resize(1200, 800)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(path.join(kycUploadPath, frontFilename));

  await sharp(req.files.backImage[0].buffer)
    .resize(1200, 800)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(path.join(kycUploadPath, backFilename));

  req.body.kycDocuments = {
    frontImage: frontFilename,
    backImage: backFilename,
    fullName,
    nationalNumber,
  };

  next();
});

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'Success' });
});

// @desc    Submit KYC documents
// @route   PUT /api/v1/users/kyc/submit
// @access  Private/Protect
exports.submitKyc = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      kycStatus: 'approved',
      kycDocuments: {
        frontImage: req.body.kycDocuments.frontImage,
        backImage: req.body.kycDocuments.backImage,
        fullName: req.body.kycDocuments.fullName,
        nationalNumber: req.body.kycDocuments.nationalNumber,
        submittedAt: Date.now(),
      },
      kycReview: {
        reviewedBy: req.user._id,
        reviewedAt: Date.now(),
        rejectionReason: undefined,
      },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'Success',
    message: 'تم التحقق من الهوية والموافقة عليها تلقائياً بنجاح',
    data: user,
  });
});

// @desc    Review KYC (approve/reject)
// @route   PUT /api/v1/users/kyc/:id/review
// @access  Private/Admin
exports.reviewKyc = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  if (!user.kycDocuments?.frontImage || !user.kycDocuments?.backImage) {
    return next(new ApiError('This user did not submit KYC documents yet', 400));
  }

  user.kycStatus = status;
  user.kycReview = {
    reviewedBy: req.user._id,
    reviewedAt: Date.now(),
    rejectionReason: status === 'rejected' ? rejectionReason : undefined,
  };

  await user.save();

  res.status(200).json({
    status: 'Success',
    message: `KYC ${status} successfully`,
    data: user,
  });
});

// @desc    Admin KYC requests list with filtering
// @route   GET /api/v1/users/admin/kyc-requests
// @access  Private/Admin
exports.getAdminKycRequests = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const status = req.query.status
    ? String(req.query.status).toLowerCase()
    : 'all';

  const filter = {};
  if (status && status !== 'all') {
    filter.kycStatus = status;
  }

  // Only records with uploaded documents should appear in KYC management list.
  filter['kycDocuments.frontImage'] = { $exists: true, $ne: null };
  filter['kycDocuments.backImage'] = { $exists: true, $ne: null };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { 'kycDocuments.fullName': { $regex: search, $options: 'i' } },
      { 'kycDocuments.nationalNumber': { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .sort('-kycDocuments.submittedAt')
    .skip(skip)
    .limit(limit)
    .select(
      'name email phone kycStatus kycDocuments kycReview active createdAt'
    );

  const total = await User.countDocuments(filter);

  const [allCount, approvedCount, pendingCount, rejectedCount] = await Promise.all([
    User.countDocuments({
      'kycDocuments.frontImage': { $exists: true, $ne: null },
      'kycDocuments.backImage': { $exists: true, $ne: null },
    }),
    User.countDocuments({
      kycStatus: 'approved',
      'kycDocuments.frontImage': { $exists: true, $ne: null },
      'kycDocuments.backImage': { $exists: true, $ne: null },
    }),
    User.countDocuments({
      kycStatus: 'pending',
      'kycDocuments.frontImage': { $exists: true, $ne: null },
      'kycDocuments.backImage': { $exists: true, $ne: null },
    }),
    User.countDocuments({
      kycStatus: 'rejected',
      'kycDocuments.frontImage': { $exists: true, $ne: null },
      'kycDocuments.backImage': { $exists: true, $ne: null },
    }),
  ]);

  const data = users.map((u) => ({
    userId: u._id,
    userCode: `USR-${String(u._id).slice(-6).toUpperCase()}`,
    fullName: u.name,
    email: u.email,
    phone: u.phone,
    accountStatus: u.active ? 'active' : 'blocked',
    kycStatus: u.kycStatus,
    submittedAt: u.kycDocuments ? u.kycDocuments.submittedAt : null,
    frontImage: u.kycDocuments ? u.kycDocuments.frontImage : null,
    backImage: u.kycDocuments ? u.kycDocuments.backImage : null,
    kycFullName: u.kycDocuments ? u.kycDocuments.fullName : null,
    nationalNumber: u.kycDocuments ? u.kycDocuments.nationalNumber : null,
    rejectionReason: u.kycReview ? u.kycReview.rejectionReason : null,
    reviewedAt: u.kycReview ? u.kycReview.reviewedAt : null,
    reviewedBy: u.kycReview ? u.kycReview.reviewedBy : null,
  }));

  res.status(200).json({
    status: 'Success',
    results: data.length,
    counters: {
      all: allCount,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  });
});

const buildAdminUserStatus = (user) => {
  if (!user.active) return 'blocked';
  if (user.kycStatus === 'approved') return 'active';
  return 'pending';
};

// @desc    Admin users management list
// @route   GET /api/v1/users/admin/list
// @access  Private/Admin
exports.getAdminUsersManagementList = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const status = req.query.status ? String(req.query.status).toLowerCase() : '';
  const kycStatus = req.query.kycStatus
    ? String(req.query.kycStatus).toLowerCase()
    : '';

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (kycStatus) {
    filter.kycStatus = kycStatus;
  }
  if (status === 'blocked') {
    filter.active = false;
  } else if (status === 'active') {
    filter.active = true;
    filter.kycStatus = 'approved';
  } else if (status === 'pending') {
    filter.active = true;
    filter.kycStatus = { $in: ['pending', 'not_submitted'] };
  }

  const users = await User.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .select('name email phone walletBalance active kycStatus createdAt');
  const total = await User.countDocuments(filter);

  const data = users.map((u) => ({
    id: u._id,
    userCode: `USR-${String(u._id).slice(-6).toUpperCase()}`,
    fullName: u.name,
    email: u.email,
    phone: u.phone,
    balance: u.walletBalance || 0,
    status: buildAdminUserStatus(u),
    kycStatus: u.kycStatus,
    registeredAt: u.createdAt,
  }));

  res.status(200).json({
    status: 'Success',
    results: data.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  });
});

// @desc    Admin user details
// @route   GET /api/v1/users/admin/:id/details
// @access  Private/Admin
exports.getAdminUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    'planSubscriptions.plan',
    'name price hashrate hashrateUnit roiMinPercent roiMaxPercent durationDays'
  );

  if (!user) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      id: user._id,
      userCode: `USR-${String(user._id).slice(-6).toUpperCase()}`,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImg: user.profileImg,
      role: user.role,
      balance: user.walletBalance || 0,
      status: buildAdminUserStatus(user),
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments,
      kycReview: user.kycReview,
      activePlanSubscriptionsCount: (user.planSubscriptions || []).filter(
        (s) => s.status === 'active'
      ).length,
      planSubscriptions: user.planSubscriptions || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// @desc    Admin block user
// @route   PATCH /api/v1/users/admin/:id/block
// @access  Private/Admin
exports.blockUserByAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'Success',
    message: 'User blocked successfully',
    data: user,
  });
});

// @desc    Admin unblock user
// @route   PATCH /api/v1/users/admin/:id/unblock
// @access  Private/Admin
exports.unblockUserByAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: true },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'Success',
    message: 'User unblocked successfully',
    data: user,
  });
});

// @desc    Admin adjust user wallet balance
// @route   POST /api/v1/users/admin/:id/wallet-adjust
// @access  Private/Admin
exports.adjustUserWalletByAdmin = asyncHandler(async (req, res, next) => {
  const { action, amount, note } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  const balanceBefore = user.walletBalance || 0;
  const delta = Number(amount);
  const isAdd = action === 'add';
  const balanceAfter = isAdd ? balanceBefore + delta : balanceBefore - delta;

  if (!isAdd && balanceAfter < 0) {
    return next(new ApiError('Insufficient user balance for deduction', 400));
  }

  user.walletBalance = balanceAfter;
  await user.save();

  const transaction = await WalletTransaction.create({
    user: user._id,
    type: isAdd ? 'deposit' : 'withdraw',
    status: 'completed',
    amount: delta,
    currency: 'USD',
    balanceBefore,
    balanceAfter,
    note: note || `Admin wallet ${isAdd ? 'add' : 'remove'} action`,
    createdBy: req.user._id,
  });

  res.status(200).json({
    status: 'Success',
    message: `User balance ${isAdd ? 'increased' : 'decreased'} successfully`,
    data: {
      userId: user._id,
      balanceBefore,
      balanceAfter,
      transaction,
    },
  });
});
