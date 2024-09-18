/**
 * BOOKKEEPR
 * Settings routes
 */

const basicAuth = require('@/middleware/basicAuth');
const router = require('express').Router();

const settingsController = require('@/controllers/settings.js');

router.get('/', settingsController.getSettings);
router.post('/', basicAuth, settingsController.setSettings);

router.post('/vacuum', basicAuth, settingsController.runVacuum);

module.exports = router;
