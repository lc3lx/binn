const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require("../models/userModel");
const {
  resolveInviterIdFromReferralCode,
} = require("./referralService");

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  let referredBy;
  if (req.body.referralCode) {
    const inviterId = await resolveInviterIdFromReferralCode(req.body.referralCode);
    if (!inviterId) {
      return next(new ApiError("Invalid or inactive referral code", 400));
    }
    referredBy = inviterId;
  }

  // 1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    ...(referredBy ? { referredBy } : {}),
  });

  // 2- Generate token
  const token = createToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({ data: userObj, token });
});

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await User.findOne({ email: req.body.email });

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(req.body.password, user.password))
  ) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  if (user.active === false) {
    return next(
      new ApiError(
        "تم حظر هذا الحساب من قبل الإدارة. يرجى التواصل مع الدعم الفني.",
        403
      )
    );
  }
  // 3) generate token
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  const token = createToken(user._id);

  // Delete password from response
  delete user._doc.password;
  // 4) send response to client side
  res.status(200).json({ data: user, token });
});

// @desc    Login/Register with Google ID token
// @route   POST /api/v1/auth/google
// @access  Public
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    return next(new ApiError("Google idToken is required", 400));
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return next(new ApiError("GOOGLE_CLIENT_ID is not configured", 500));
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return next(new ApiError("Invalid Google token", 401));
  }

  if (!payload || !payload.email || !payload.email_verified) {
    return next(new ApiError("Google account email is not verified", 401));
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    let referredBy;
    if (req.body.referralCode) {
      referredBy = await resolveInviterIdFromReferralCode(req.body.referralCode);
      if (!referredBy) {
        return next(new ApiError("Invalid or inactive referral code", 400));
      }
    }
    user = await User.create({
      name: payload.name || email.split("@")[0],
      email,
      googleId: payload.sub,
      authProvider: "google",
      profileImg: payload.picture,
      ...(referredBy ? { referredBy } : {}),
    });
  } else if (!user.googleId && payload.sub) {
    user.googleId = payload.sub;
    if (!user.profileImg && payload.picture) user.profileImg = payload.picture;
    if (!user.authProvider) user.authProvider = "google";
    await user.save();
  }

  if (user.active === false) {
    return next(
      new ApiError(
        "تم حظر هذا الحساب من قبل الإدارة. يرجى التواصل مع الدعم الفني.",
        403
      )
    );
  }

  const token = createToken(user._id);
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({ data: userObj, token });
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401,
      ),
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401,
      ),
    );
  }

  if (currentUser.active === false) {
    return next(
      new ApiError(
        'Your account is blocked or deactivated. Please contact support',
        403
      )
    );
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10,
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401,
        ),
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403),
      );
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404),
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on your Binance Mining account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Binance Mining Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404),
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
