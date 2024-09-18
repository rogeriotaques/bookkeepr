/**
 * BOOKKEEPR
 * Routes for API
 */

const router = require('express').Router();

const basicAuth = require('@/middleware/basicAuth');

// Only some routes are protected
// so, basicAuth is implemented case-by-case
router.use('/auth', require('@/routes/auth'));
router.use('/settings', require('@/routes/settings'));

// The entire route is protected
router.use('/wallets', basicAuth, require('@/routes/wallets'));
router.use('/groups', basicAuth, require('@/routes/groups'));
router.use('/entries', basicAuth, require('@/routes/entries'));
router.use('/reports', basicAuth, require('@/routes/reports'));

module.exports = router;
