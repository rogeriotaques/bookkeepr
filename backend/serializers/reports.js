exports.serializeOverviewReport = ({ year, data, insights, budgets, planned, realized }) => ({
  year,
  data,
  insights,
  budgets,
  planned,
  realized,
});

exports.serializeMonthlyReport = ({ year, month, budgetTotal, actualTotal, progress, breakdown, planned, realized }) => ({
  year,
  month,
  budgetTotal,
  actualTotal,
  progress,
  breakdown,
  planned,
  realized,
});
