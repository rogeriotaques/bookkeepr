const dayjs = require('dayjs');
const { ENTRY_OPERATIONS } = require('@/constants');

const MAX_LABEL = 20;

const formatCurrency = (value) =>
  `¥ ${Math.round(Number(value) || 0).toLocaleString('en-US')}`;

const truncateLabel = (label) => {
  const text = String(label ?? '').trim();
  return text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL).trimEnd()}…` : text;
};

/**
 * Turn one month of numbers into a Kakeibo-style insight.
 * Pure: no knex, no clock. The caller supplies the context.
 */
exports.buildInsight = (context) => {
  const {
    monthName,
    isCurrentMonth,
    isPastMonth,
    dayOfMonth,
    daysLeft,
    hasPlan,
    goal,
    monthPlanned,
    monthRealized,
    budgetLeft,
    dailyAllowance,
    spentPct,
    elapsedPct,
    topOverspend,
    entryCountThisMonth,
    monthSurplus,
    plannedSurplus,
    paceBasis,
  } = context;

  const plannedIncome = Number(monthPlanned.income) || 0;
  const plannedExpense = Number(monthPlanned.expense) || 0;
  const realizedIncome = Number(monthRealized.income) || 0;
  const realizedExpense = Number(monthRealized.expense) || 0;

  if (!hasPlan) {
    return {
      code: 'no_plan',
      title: `No plan for ${monthName}`,
      subtitle: 'Add income and expenses in Planning.',
    };
  }

  if (isCurrentMonth && entryCountThisMonth === 0) {
    return {
      code: 'empty_ledger',
      title: 'Nothing logged yet',
      subtitle: "Add today's spending when you make it.",
    };
  }

  if (plannedExpense > 0 && realizedExpense > plannedExpense) {
    const over = realizedExpense - plannedExpense;

    // Spending more than planned is not a loss when the month still kept
    // money. Lead with the surplus, then state the overage.
    if (monthSurplus > 0) {
      return {
        code: 'wealth',
        title: 'You are building wealth',
        subtitle: `You kept ${formatCurrency(monthSurplus)}, even with ${formatCurrency(over)} over plan.`,
      };
    }

    const subtitle = topOverspend
      ? `You are ${formatCurrency(over)} over. Check ${truncateLabel(topOverspend.label)}.`
      : `You are ${formatCurrency(over)} over. Review fixed costs.`;

    return { code: 'over_budget', title: 'You went over plan', subtitle };
  }

  if (
    (isCurrentMonth || isPastMonth) &&
    dayOfMonth >= 20 &&
    plannedIncome > 0 &&
    realizedIncome * 100 < plannedIncome * 90
  ) {
    const short = plannedIncome - realizedIncome;

    return {
      code: 'income_short',
      title: 'Income is below plan',
      subtitle: `${formatCurrency(short)} less than planned. Adjust this month.`,
    };
  }

  if (isCurrentMonth && realizedExpense <= plannedExpense && topOverspend) {
    const under = plannedExpense - realizedExpense;

    return {
      code: 'category_over',
      title: `${truncateLabel(topOverspend.label)} is over plan`,
      subtitle: `${formatCurrency(topOverspend.delta)} over, but you are ${formatCurrency(under)} under overall.`,
    };
  }

  if (isCurrentMonth && dayOfMonth >= 7 && spentPct - elapsedPct >= 10) {
    const basis = paceBasis === 'variable' ? 'variable spending' : 'spending';

    return {
      code: 'fast_pace',
      title: 'Spending is a little fast',
      subtitle: `Hold ${basis} to ${formatCurrency(dailyAllowance)} a day.`,
    };
  }

  if (isCurrentMonth && dayOfMonth <= 10 && String(goal ?? '').trim() === '') {
    return {
      code: 'no_goal',
      title: 'What do you want this month?',
      subtitle: 'Write your goal in Planning.',
    };
  }

  if (daysLeft <= 2 && realizedExpense <= plannedExpense) {
    const under = plannedExpense - realizedExpense;
    const tail = under > 0 ? `${formatCurrency(under)} under plan` : 'right on plan';

    return {
      code: 'month_closed',
      title: `${monthName} is nearly over`,
      subtitle: `You spent ${formatCurrency(realizedExpense)}, ${tail}.`,
    };
  }

  if (dayOfMonth >= 20 && plannedSurplus > 0 && monthSurplus >= plannedSurplus) {
    return {
      code: 'plan_met',
      title: 'You met your plan',
      subtitle: `You kept ${formatCurrency(monthSurplus)}. Move it to savings.`,
    };
  }

  if (dayOfMonth >= 20 && monthSurplus > 0) {
    return {
      code: 'positive',
      title: "You're doing great!",
      subtitle: `You kept ${formatCurrency(monthSurplus)} this month.`,
    };
  }

  return {
    code: 'on_plan',
    title: 'You are on plan',
    subtitle: `${formatCurrency(budgetLeft)} left for ${daysLeft} days.`,
  };
};

const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

/**
 * Read the current month's plan and actuals, then build the insight.
 * `today` is injectable so the rules never depend on the wall clock.
 */
exports.getInsight = async (knex, { year, month, today = dayjs() }) => {
  const now = dayjs(today);
  const yearNum = Number(year);
  const monthNum = Number(month);
  const monthName = now.month(monthNum - 1).format('MMMM');

  const thisYear = now.year();
  const thisMonth = now.month() + 1;
  const isCurrentMonth = yearNum === thisYear && monthNum === thisMonth;
  const isPastMonth =
    yearNum < thisYear || (yearNum === thisYear && monthNum < thisMonth);

  const daysInMonth = now.month(monthNum - 1).daysInMonth();
  const dayOfMonth = isCurrentMonth ? now.date() : isPastMonth ? daysInMonth : 0;
  const daysLeft = isCurrentMonth
    ? daysInMonth - dayOfMonth + 1
    : isPastMonth
      ? 0
      : daysInMonth;
  const elapsedPct = Math.round((dayOfMonth / daysInMonth) * 100);

  const budget = await knex('monthly_budgets')
    .where({ year: yearNum, month: monthNum })
    .first();

  const goal = String(budget?.goal ?? '').trim();

  const items = budget
    ? await knex('budget_items')
        .leftJoin('groups', 'budget_items.group_code', 'groups.code')
        .where('budget_items.budget_id', budget.id)
        .select(
          'budget_items.type',
          'budget_items.amount',
          'budget_items.group_code',
          'budget_items.expense_type as item_expense_type',
          'groups.name as group_name',
          'groups.expense_type as group_expense_type'
        )
    : [];

  const monthPlanned = { income: 0, expense: 0 };
  const plannedByGroup = new Map();
  let monthPlannedVariable = 0;

  for (const item of items) {
    const amount = Number(item.amount) || 0;

    if (item.type === 'income') {
      monthPlanned.income += amount;
      continue;
    }

    if (item.type !== 'expense') continue;

    monthPlanned.expense += amount;

    const expenseType = item.item_expense_type ?? item.group_expense_type ?? null;
    if (expenseType !== 'fixed') monthPlannedVariable += amount;

    if (item.group_code == null) continue;

    const group = plannedByGroup.get(item.group_code) ?? {
      planned: 0,
      label: item.group_name || String(item.group_code),
      variable: expenseType !== 'fixed',
    };
    group.planned += amount;
    if (expenseType !== 'fixed') group.variable = true;
    plannedByGroup.set(item.group_code, group);
  }

  const key = monthKey(yearNum, monthNum);

  const actualRows = await knex('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.EXPENSE)
    .whereRaw("strftime('%Y-%m', entries.date) = ?", [key])
    .groupBy('entries.group')
    .select(
      'entries.group as group_code',
      'groups.name as group_name',
      'groups.expense_type as group_expense_type'
    )
    .sum('entries.amount as total')
    .count('entries.id as count');

  const incomeRow = await knex('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.INCOME)
    .whereRaw("strftime('%Y-%m', entries.date) = ?", [key])
    .sum('entries.amount as total')
    .first();

  const monthRealized = {
    income: Number(incomeRow?.total ?? 0),
    expense: 0,
  };
  let monthRealizedVariable = 0;
  let entryCountThisMonth = 0;

  for (const row of actualRows) {
    const total = Number(row.total) || 0;
    monthRealized.expense += total;
    entryCountThisMonth += Number(row.count) || 0;
    if (row.group_expense_type !== 'fixed') monthRealizedVariable += total;
  }

  let topOverspend = null;
  for (const row of actualRows) {
    const actual = Number(row.total) || 0;
    if (actual <= 0) continue;

    const group = plannedByGroup.get(row.group_code);
    let candidate = null;

    if (group) {
      if (!group.variable) continue;
      const delta = actual - group.planned;
      if (delta <= 0) continue;
      candidate = { label: group.label, planned: group.planned, actual, delta };
    } else {
      // Spending with no budget item still deserves a name, as long as the
      // group is not committed. This is the common case in real data.
      if (row.group_expense_type === 'fixed') continue;
      candidate = {
        label: row.group_name || String(row.group_code),
        planned: 0,
        actual,
        delta: actual,
      };
    }

    if (!topOverspend || candidate.delta > topOverspend.delta) {
      topOverspend = candidate;
    }
  }

  const hasPlan = monthPlanned.income + monthPlanned.expense > 0;
  const paceBasis = monthPlannedVariable > 0 ? 'variable' : 'total';
  const basisPlanned =
    paceBasis === 'variable' ? monthPlannedVariable : monthPlanned.expense;
  const basisActual =
    paceBasis === 'variable' ? monthRealizedVariable : monthRealized.expense;
  const spentPct =
    basisPlanned > 0 ? Math.round((basisActual / basisPlanned) * 100) : 0;

  const budgetLeft = Math.max(0, monthPlanned.expense - monthRealized.expense);
  const basisLeft = Math.max(0, basisPlanned - basisActual);
  const dailyAllowance = daysLeft > 0 ? Math.round(basisLeft / daysLeft) : 0;

  return exports.buildInsight({
    monthName,
    isCurrentMonth,
    isPastMonth,
    dayOfMonth,
    daysLeft,
    hasPlan,
    goal,
    monthPlanned,
    monthRealized,
    budgetLeft,
    dailyAllowance,
    spentPct,
    elapsedPct,
    topOverspend,
    entryCountThisMonth,
    monthSurplus: monthRealized.income - monthRealized.expense,
    plannedSurplus: monthPlanned.income - monthPlanned.expense,
    paceBasis,
  });
};

exports.formatCurrency = formatCurrency;
