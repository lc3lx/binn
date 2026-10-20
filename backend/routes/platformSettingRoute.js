const express = require('express');

const authService = require('../services/authService');
const {
  getPlatformSettings,
  updatePlatformSettings,
} = require('../services/platformSettingService');
const {
  updatePlatformSettingsValidator,
} = require('../utils/validators/platformSettingValidator');

const router = express.Router();

// Read settings (useful for dashboard/client)
router.get('/', getPlatformSettings);

// Update settings from admin panel
router.use(authService.protect);
router.use(authService.allowedTo('admin', 'manager'));
router.put('/', updatePlatformSettingsValidator, updatePlatformSettings);

module.exports = router;

