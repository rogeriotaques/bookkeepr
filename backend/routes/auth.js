/**
 * BOOKKEEPR
 * Auth routes
 */

const authController = require('@/controllers/auth.js');

const router = require('express').Router();

router.post('/', authController.authenticateUser);

module.exports = router;
