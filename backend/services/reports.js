const dayjs = require('dayjs');
const { ENTRY_OPERATIONS } = require('@/constants');

const isValidYear = (year) => year && dayjs(year).isValid() && !isNaN(Number(year));
const isValidMonth = (month) => {
  const num = Number(month);
  return month && Number.isInteger(num) && num >= 1 && num <= 12;
};

exports.getOverviewReport = async (knex, { year }) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => `0${m}`.slice(-2));
  const activeGroups = await knex('groups').where('active', true).orderBy('code', 'asc');

  const data = {
    income: [],
    outcome: [],
    balance: ['-'],
    tax: ['-'],
  };

  await Promise.all(
    activeGroups.map(async (group) => {
      const groupCode = `${group.code}`.padStart(2, '0');
      const entry = [`${groupCode} - ${group.name}`];

      await Promise.all(
        months.map(async (month) => {
          const row = await knex
            .sum('amount AS amount')
            .from('entries')
            .where({ group: group.code })
            .whereRaw("strftime('%Y-%m', date) = ?", [`${year}-${month}`])
            .first();

          entry.push(row && row.amount ? row.amount : 0);
        })
      );

      if (data[group.operation]) {
        data[group.operation].push(entry);
      }
    })
  );

  const shouhizei = await knex('config')
    .where({ key: 'shouhizei' })
    .select('value')
    .first()
    .then((row) => row?.value ?? 0)
    .catch(() => 0);

  const insights = {
    thisYear: { income: 0, outcome: 0 },
    thisMonth: { income: 0, outcome: 0 },
    today: { income: 0, outcome: 0 },
  };

  const now = dayjs();
  const thisMonth = now.month() + 1;

  for (const income of data.income) {
    for (let i = 1; i < income.length; i++) {
      if (!data.balance[i]) data.balance[i] = 0;
      if (!data.tax[i]) data.tax[i] = 0;

      data.balance[i] += Number(income[i]);
      data.tax[i] += Number(income[i]) * shouhizei;
      insights.thisYear.income += Number(income[i]);
      if (i === thisMonth) insights.thisMonth.income += Number(income[i]);
    }
  }

  for (const outcome of data.outcome) {
    for (let i = 1; i < outcome.length; i++) {
      data.balance[i] -= Number(outcome[i]);
      insights.thisYear.outcome += Number(outcome[i]);
      if (i === thisMonth) insights.thisMonth.outcome += Number(outcome[i]);
    }
  }

  insights.today.income = await knex
    .sum('amount AS amount')
    .from('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.INCOME)
    .where('date', dayjs().format('YYYY-MM-DD'))
    .first()
    .then((row) => row?.amount ?? 0)
    .catch(() => 0);

  insights.today.outcome = await knex
    .sum('amount AS amount')
    .from('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.EXPENSE)
    .where('date', dayjs().format('YYYY-MM-DD'))
    .first()
    .then((row) => row?.amount ?? 0)
    .catch(() => 0);

  // Budget vs actual per month
  const budgets = [];
  const monthlyBudgets = await knex('monthly_budgets').where({ year: Number(year) }).select('*');

  for (const budget of monthlyBudgets) {
    const budgetItems = await knex('budget_items')
      .where({ budget_id: budget.id, type: 'expense' })
      .sum('amount AS total')
      .first();

    const actualEntries = await knex('entries')
      .innerJoin('groups', 'entries.group', 'groups.code')
      .where('groups.operation', ENTRY_OPERATIONS.EXPENSE)
      .whereRaw("strftime('%Y-%m', date) = ?", [`${year}-${String(budget.month).padStart(2, '0')}`])
      .sum('entries.amount AS total')
      .first();

    budgets.push({
      month: budget.month,
      budget: budgetItems.total ?? 0,
      actual: actualEntries.total ?? 0,
    });
  }

  return { year, data, insights, budgets };
};

exports.getMonthlyReport = async (knex, { year, month }) => {
  const yearNum = Number(year);
  const monthNum = Number(month);

  const budget = await knex('monthly_budgets')
    .where({ year: yearNum, month: monthNum })
    .first();

  const items = budget
    ? await knex('budget_items').where({ budget_id: budget.id, type: 'expense' }).select('*')
    : [];

  const actuals = await knex('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.EXPENSE)
    .whereRaw("strftime('%Y-%m', date) = ?", [`${year}-${String(monthNum).padStart(2, '0')}`])
    .select('entries.group AS group_code', knex.raw('SUM(entries.amount) AS total'))
    .groupBy('entries.group');

  const actualMap = new Map(actuals.map((a) => [a.group_code, a.total]));

  const breakdown = items.map((item) => ({
    group_code: item.group_code,
    label: item.label,
    budget: item.amount,
    actual: actualMap.get(item.group_code) ?? 0,
    expense_type: item.expense_type,
  }));

  // Include categories with actuals but no budget
  for (const actual of actuals) {
    const exists = breakdown.find((b) => b.group_code === actual.group_code);
    if (!exists) {
      breakdown.push({
        group_code: actual.group_code,
        label: actual.group_code,
        budget: 0,
        actual: actual.total,
        expense_type: null,
      });
    }
  }

  const budgetTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const actualTotal = actuals.reduce((sum, a) => sum + a.total, 0);
  const progress = budgetTotal > 0 ? (actualTotal / budgetTotal) * 100 : 0;

  return { year: yearNum, month: monthNum, budgetTotal, actualTotal, progress, breakdown };
};

exports.validateYear = (year) => isValidYear(year);
exports.validateMonth = (month) => isValidMonth(month);
