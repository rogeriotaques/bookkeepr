/**
 * BOOKKEEPR
 * Routes for API
 */

const router = require('express').Router();

router.use('/settings', require('@/routes/v1/settings'));
router.use('/wallets', require('@/routes/v1/wallets'));

module.exports = router;
