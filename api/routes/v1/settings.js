/**
 * BOOKKEEPR
 * Settings routes
 */

const settingsController = require('@/controllers/settings.js');

const router = require('express').Router();

router.get('/', settingsController.getSettings);

module.exports = router;
