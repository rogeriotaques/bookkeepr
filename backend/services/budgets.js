const { withTransaction } = require('@/lib/db');

const isValidYear = (year) => {
  const num = Number(year);
  return Number.isInteger(num) && num >= 1900 && num <= 2100;
};

const isValidMonth = (month) => {
  const num = Number(month);
  return Number.isInteger(num) && num >= 1 && num <= 12;
};

const validateItems = async (items, knex) => {
  if (!Array.isArray(items)) {
    return 'Items must be an array';
  }

  for (const item of items) {
    if (!item.type || !['income', 'expense'].includes(item.type)) {
      return 'Invalid item type';
    }
    if (typeof item.label !== 'string' || item.label.trim() === '') {
      return 'Item label is required';
    }
    const amount = parseFloat(item.amount);
    if (isNaN(amount) || amount < 0) {
      return 'Item amount must be a positive number';
    }

    if (item.type === 'expense' && item.group_code != null) {
      const group = await knex('groups')
        .where({ code: item.group_code, active: 1, operation: 'outcome' })
        .first();
      if (!group) {
        return `Invalid group_code ${item.group_code}`;
      }
    }
  }

  return null;
};

exports.validateYearMonth = (year, month) => {
  if (!isValidYear(year) || !isValidMonth(month)) {
    return 'Invalid year or month';
  }
  return null;
};

exports.validateBudgetItems = validateItems;

exports.getBudget = async (knex, { year, month }) => {
  const budget = await knex('monthly_budgets')
    .where({ year: Number(year), month: Number(month) })
    .first();

  if (!budget) {
    return { budget: null, items: [] };
  }

  const items = await knex('budget_items')
    .where({ budget_id: budget.id })
    .orderBy('sort_order', 'asc')
    .orderBy('id', 'asc');

  return { budget, items };
};

exports.createBudget = async (knex, { year, month, goal = '', items = [] }) => {
  const itemsError = await validateItems(items, knex);
  if (itemsError) {
    return { error: itemsError };
  }

  const existing = await knex('monthly_budgets')
    .where({ year: Number(year), month: Number(month) })
    .first();

  if (existing) {
    return { error: 'Budget already exists for this month' };
  }

  const budget = await withTransaction(async (trx) => {
    const [budgetId] = await trx('monthly_budgets').insert({
      year: Number(year),
      month: Number(month),
      goal,
    });

    if (items.length > 0) {
      const rows = items.map((item, index) => ({
        budget_id: budgetId,
        type: item.type,
        label: item.label,
        group_code: item.group_code || null,
        amount: parseFloat(item.amount),
        expense_type: item.expense_type || null,
        sort_order: item.sort_order ?? index,
      }));
      await trx('budget_items').insert(rows);
    }

    return await trx('monthly_budgets').where({ id: budgetId }).first();
  });

  return { budget };
};

exports.updateBudget = async (knex, { id, goal = '', items = [] }) => {
  const budget = await knex('monthly_budgets').where({ id }).first();
  if (!budget) {
    return { error: 'Budget not found', statusCode: 404 };
  }

  const itemsError = await validateItems(items, knex);
  if (itemsError) {
    return { error: itemsError, statusCode: 400 };
  }

  await withTransaction(async (trx) => {
    await trx('monthly_budgets').where({ id }).update({ goal, updated_at: trx.fn.now() });
    await trx('budget_items').where({ budget_id: id }).del();

    if (items.length > 0) {
      const rows = items.map((item, index) => ({
        budget_id: id,
        type: item.type,
        label: item.label,
        group_code: item.group_code || null,
        amount: parseFloat(item.amount),
        expense_type: item.expense_type || null,
        sort_order: item.sort_order ?? index,
      }));
      await trx('budget_items').insert(rows);
    }
  });

  return { success: true };
};

exports.deleteBudget = async (knex, { id }) => {
  const budget = await knex('monthly_budgets').where({ id }).first();
  if (!budget) {
    return { error: 'Budget not found', statusCode: 404 };
  }

  await knex('monthly_budgets').where({ id }).del();
  return { success: true };
};
