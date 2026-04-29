const budgetsService = require('@/services/budgets');
const budgetsSerializer = require('@/serializers/budgets');

exports.getBudget = async (req, res) => {
  const { year, month } = req.query;

  if (year === undefined || month === undefined) {
    return res.status(400).json({ success: false, message: 'Year and month are required' });
  }

  const validationError = budgetsService.validateYearMonth(year, month);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const result = await budgetsService.getBudget(global.knex, { year, month });
  res.json({ success: true, ...budgetsSerializer.serializeBudgetWithItems(result) });
};

exports.createBudget = async (req, res) => {
  const { year, month, goal, items } = req.body;

  const validationError = budgetsService.validateYearMonth(year, month);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const result = await budgetsService.createBudget(global.knex, { year, month, goal, items });

  if (result.error) {
    return res.status(400).json({ success: false, message: result.error });
  }

  res.json({ success: true, budget: budgetsSerializer.serializeBudget(result.budget) });
};

exports.updateBudget = async (req, res) => {
  const { id } = req.params;
  const { goal, items } = req.body;

  const result = await budgetsService.updateBudget(global.knex, { id, goal, items });

  if (result.error) {
    return res.status(result.statusCode || 400).json({ success: false, message: result.error });
  }

  res.json({ success: true });
};

exports.deleteBudget = async (req, res) => {
  const { id } = req.params;

  const result = await budgetsService.deleteBudget(global.knex, { id });

  if (result.error) {
    return res.status(result.statusCode || 400).json({ success: false, message: result.error });
  }

  res.json({ success: true });
};
