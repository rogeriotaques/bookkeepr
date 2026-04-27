/**
 * BOOKKEEPR
 * Auth routes
 */

const basicAuth = require("@/middleware/basicAuth");
const router = require("express").Router();
const rateLimit = require("express-rate-limit");

const authController = require("@/controllers/auth.js");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

router.post("/passwd", basicAuth, authController.saveUserPassword);
router.post("/", authLimiter, authController.authenticateUser);
router.delete("/passwd", basicAuth, authController.deleteUserPassword);

module.exports = router;
