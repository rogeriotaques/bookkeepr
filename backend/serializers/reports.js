exports.serializeOverviewReport = ({ year, data, insights, budgets }) => ({
  year,
  data,
  insights,
  budgets,
});

exports.serializeMonthlyReport = ({ year, month, budgetTotal, actualTotal, progress, breakdown }) => ({
  year,
  month,
  budgetTotal,
  actualTotal,
  progress,
  breakdown,
});
