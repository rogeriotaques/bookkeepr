/**
 * BOOKKEEPR
 * Reports routes
 */

const router = require('express').Router();

const reportsController = require('@/controllers/reports');

router.get('/', reportsController.getOverviewReport);

module.exports = router;
