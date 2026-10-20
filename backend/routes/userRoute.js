const express = require('express');
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
  submitKycValidator,
  reviewKycValidator,
  adminUserManagementQueryValidator,
  adminUserIdValidator,
  adminAdjustWalletValidator,
  adminKycRequestsQueryValidator,
} = require('../utils/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  uploadKycImages,
  resizeKycImages,
  submitKyc,
  reviewKyc,
  getAdminUsersManagementList,
  getAdminUserDetails,
  blockUserByAdmin,
  unblockUserByAdmin,
  adjustUserWalletByAdmin,
  getAdminKycRequests,
} = require('../services/userService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.put(
  '/kyc/submit',
  uploadKycImages,
  submitKycValidator,
  resizeKycImages,
  submitKyc
);
router.delete('/deleteMe', deleteLoggedUserData);

// Admin
router.use(authService.allowedTo('admin', 'manager'));
router.put(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword
);
router.put('/kyc/:id/review', reviewKycValidator, reviewKyc);
router.get(
  '/admin/list',
  adminUserManagementQueryValidator,
  getAdminUsersManagementList
);
router.get('/admin/:id/details', adminUserIdValidator, getAdminUserDetails);
router.patch('/admin/:id/block', adminUserIdValidator, blockUserByAdmin);
router.patch('/admin/:id/unblock', adminUserIdValidator, unblockUserByAdmin);
router.post(
  '/admin/:id/wallet-adjust',
  adminAdjustWalletValidator,
  adjustUserWalletByAdmin
);
router.get(
  '/admin/kyc-requests',
  adminKycRequestsQueryValidator,
  getAdminKycRequests
);
router
  .route('/')
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
