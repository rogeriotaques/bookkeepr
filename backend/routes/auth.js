/**
 * BOOKKEEPR
 * Auth routes
 */

const basicAuth = require('@/middleware/basicAuth');
const router = require('express').Router();

const authController = require('@/controllers/auth.js');

router.post('/', authController.authenticateUser);
router.post('/passwd', basicAuth, authController.saveUserPassword);
router.delete('/passwd', basicAuth, authController.deleteUserPassword);

module.exports = router;
