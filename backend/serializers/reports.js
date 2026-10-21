exports.serializeOverviewReport = ({ year, data, insights, budgets, planned, realized }) => ({
  year,
  data,
  insights,
  budgets,
  planned,
  realized,
});

exports.serializeInsight = ({ code, title, subtitle }) => ({
  insight: { code, title, subtitle },
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
