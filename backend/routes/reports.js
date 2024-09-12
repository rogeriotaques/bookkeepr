const reportsController = require('@/controllers/reports');

const router = require('express').Router();

router.get('/', reportsController.getOverviewReport);

module.exports = router;
