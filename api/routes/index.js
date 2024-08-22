/**
 * BOOKKEEPR
 * Routes for API
 */

const router = require('express').Router();

router.use('/settings', require('@/routes/v1/settings'));
router.use('/wallets', require('@/routes/v1/wallets'));
router.use('/groups', require('@/routes/v1/groups'));
router.use('/entries', require('@/routes/v1/entries'));

module.exports = router;
