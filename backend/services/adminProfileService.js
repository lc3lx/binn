const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

exports.getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await User.findById(req.user._id).select(
    'name email phone timezone language role profileImg lastLogin active walletBalance kycStatus'
  );

  if (!admin) return next(new ApiError('Admin profile not found', 404));

  res.status(200).json({
    status: 'Success',
    data: admin,
  });
});

exports.updateAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      timezone: req.body.timezone,
      language: req.body.language,
      profileImg: req.body.profileImg,
    },
    { new: true }
  ).select(
    'name email phone timezone language role profileImg lastLogin active walletBalance kycStatus'
  );

  if (!admin) return next(new ApiError('Admin profile not found', 404));

  res.status(200).json({
    status: 'Success',
    message: 'Admin profile updated successfully',
    data: admin,
  });
});

exports.changeAdminPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await User.findById(req.user._id);

  if (!admin) return next(new ApiError('Admin profile not found', 404));
  if (!admin.password) {
    return next(
      new ApiError('This account has no local password. Use social login flow.', 400)
    );
  }

  const isCorrect = await bcrypt.compare(currentPassword, admin.password);
  if (!isCorrect) {
    return next(new ApiError('Current password is incorrect', 400));
  }

  admin.password = newPassword;
  admin.passwordChangedAt = Date.now();
  await admin.save();

  res.status(200).json({
    status: 'Success',
    message: 'Password updated successfully',
  });
});

