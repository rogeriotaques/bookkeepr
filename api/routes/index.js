/**
 * BOOKKEEPR
 * Routes for API
 */

const router = require('express').Router();

router.use('/settings', require('@/routes/settings'));
router.use('/wallets', require('@/routes/wallets'));
router.use('/groups', require('@/routes/groups'));
router.use('/entries', require('@/routes/entries'));

module.exports = router;
