/**
 * BOOKKEEPR
 * Reports routes
 */

const router = require('express').Router();

const reportsController = require('@/controllers/reports');

router.get('/', reportsController.getOverviewReport);
router.get('/insight', reportsController.getInsight);
router.get('/monthly', reportsController.getMonthlyReport);

module.exports = router;
