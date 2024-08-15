/**
 * BOOKKEEPR
 * Routes for API
 */

const router = require('express').Router();

router.use('/settings', require('@/routes/v1/settings'));

module.exports = router;
