/**
 * BOOKKEEPR
 * Settings routes
 */

const settingsController = require('@/controllers/settings.js');

const router = require('express').Router();

router.get('/', settingsController.getSettings);
router.post('/', settingsController.setSettings);

router.post('/vacuum', settingsController.runVacuum);

module.exports = router;
