const dayjs = require('dayjs');
const reportsService = require('@/services/reports');
const insightsService = require('@/services/insights');
const reportsSerializer = require('@/serializers/reports');

exports.getOverviewReport = async (req, res) => {
  const { year } = req.query;

  if (!year || !dayjs(year).isValid()) {
    return res.status(400).json({ success: false, message: 'Invalid year' });
  }

  const result = await reportsService.getOverviewReport(global.knex, { year });
  res.json({ success: true, ...reportsSerializer.serializeOverviewReport(result) });
};

exports.getInsight = async (req, res) => {
  const { year, month } = req.query;

  if (!reportsService.validateYear(year)) {
    return res.status(400).json({ success: false, message: 'Invalid year' });
  }

  if (!reportsService.validateMonth(month)) {
    return res.status(400).json({ success: false, message: 'Invalid month' });
  }

  const result = await insightsService.getInsight(global.knex, {
    year,
    month,
    today: dayjs(),
  });
  res.json({ success: true, ...reportsSerializer.serializeInsight(result) });
};

exports.getMonthlyReport = async (req, res) => {
  const { year, month } = req.query;

  if (!reportsService.validateYear(year)) {
    return res.status(400).json({ success: false, message: 'Invalid year' });
  }

  if (!reportsService.validateMonth(month)) {
    return res.status(400).json({ success: false, message: 'Invalid month' });
  }

  const result = await reportsService.getMonthlyReport(global.knex, { year, month });
  res.json({ success: true, ...reportsSerializer.serializeMonthlyReport(result) });
};
