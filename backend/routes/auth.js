/**
 * BOOKKEEPR
 * Auth routes
 */

const authController = require('@/controllers/auth.js');

const router = require('express').Router();

router.post('/', authController.authenticateUser);
router.post('/passwd', authController.saveUserPassword);
router.delete('/passwd', authController.deleteUserPassword);

module.exports = router;
