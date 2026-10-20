const express = require('express');

const authService = require('../services/authService');
const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require('../services/adminProfileService');
const {
  updateAdminProfileValidator,
  changeAdminPasswordValidator,
} = require('../utils/validators/adminProfileValidator');

const router = express.Router();

router.use(authService.protect);
router.use(authService.allowedTo('admin', 'manager'));

router.get('/', getAdminProfile);
router.put('/', updateAdminProfileValidator, updateAdminProfile);
router.put('/change-password', changeAdminPasswordValidator, changeAdminPassword);

module.exports = router;

