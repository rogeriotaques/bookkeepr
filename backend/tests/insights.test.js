import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const dayjs = require('dayjs');
const { createTestApp, destroyTestApp, seedBasicData } = require('./utils');
const { buildInsight, getInsight, formatCurrency } = require('@/services/insights');

const base = (overrides = {}) => ({
  year: 2026,
  month: 10,
  monthName: 'October',
  isCurrentMonth: true,
  isPastMonth: false,
  dayOfMonth: 15,
  daysInMonth: 31,
  daysLeft: 17,
  hasPlan: true,
  goal: 'Save for a trip',
  monthPlanned: { income: 5500, expense: 2200 },
  monthRealized: { income: 5500, expense: 1000 },
  monthPlannedVariable: 700,
  monthRealizedVariable: 400,
  paceBasis: 'variable',
  budgetLeft: 1200,
  dailyAllowance: 71,
  spentPct: 57,
  elapsedPct: 48,
  topOverspend: null,
  entryCountThisMonth: 2,
  monthSurplus: 4500,
  plannedSurplus: 3300,
  ...overrides,
});

const rule = (overrides) => buildInsight(base(overrides));

describe('buildInsight rules', () => {
  it('asks for a plan when the month has none', () => {
    const insight = rule({
      hasPlan: false,
      goal: '',
      monthPlanned: { income: 0, expense: 0 },
      entryCountThisMonth: 0,
    });

    expect(insight.code).toBe('no_plan');
    expect(insight.title).toBe('No plan for October');
    expect(insight.subtitle).toBe('Add income and expenses in Planning.');
  });

  it('treats a budget row with no amounts as no plan', () => {
    const insight = rule({
      hasPlan: false,
      monthPlanned: { income: 0, expense: 0 },
      entryCountThisMonth: 0,
    });

    expect(insight.code).toBe('no_plan');
  });

  it('asks the user to start the ledger on a current month with no expenses', () => {
    const insight = rule({ entryCountThisMonth: 0, dayOfMonth: 5, elapsedPct: 16 });

    expect(insight.code).toBe('empty_ledger');
    expect(insight.title).toBe('Nothing logged yet');
    expect(insight.subtitle).toBe("Add today's spending when you make it.");
  });

  it('does not ask for a ledger on a past month', () => {
    const insight = rule({
      entryCountThisMonth: 0,
      isCurrentMonth: false,
      isPastMonth: true,
      dayOfMonth: 31,
      daysLeft: 0,
      elapsedPct: 100,
      monthRealized: { income: 5500, expense: 1000 },
    });

    expect(insight.code).toBe('month_closed');
  });

  it('treats a positive balance as wealth even when expenses are over plan', () => {
    const insight = rule({
      monthRealized: { income: 10000, expense: 2400 },
      monthSurplus: 7600,
      topOverspend: { label: 'Food', planned: 500, actual: 800, delta: 300 },
    });

    expect(insight.code).toBe('wealth');
    expect(insight.title).toBe('You are building wealth');
    expect(insight.subtitle).toBe('You kept ¥ 7,600, even with ¥ 200 over plan.');
  });

  it('warns about an over-plan month that lost money', () => {
    const insight = rule({
      monthRealized: { income: 2000, expense: 2400 },
      monthSurplus: -400,
    });

    expect(insight.code).toBe('over_budget');
  });

  it('names the main variable category when the month is over plan', () => {
    const insight = rule({
      monthRealized: { income: 2000, expense: 2400 },
      monthSurplus: -400,
      topOverspend: { label: 'Food', planned: 500, actual: 800, delta: 300 },
    });

    expect(insight.code).toBe('over_budget');
    expect(insight.title).toBe('You went over plan');
    expect(insight.subtitle).toBe('You are ¥ 200 over. Check Food.');
  });

  it('asks the user to review fixed costs when no variable category is over', () => {
    const insight = rule({
      monthRealized: { income: 2000, expense: 2400 },
      monthSurplus: -400,
      topOverspend: null,
    });

    expect(insight.code).toBe('over_budget');
    expect(insight.subtitle).toBe('You are ¥ 200 over. Review fixed costs.');
  });

  it('does not treat exactly the plan as over budget', () => {
    const insight = rule({
      monthRealized: { income: 5500, expense: 2200 },
      budgetLeft: 0,
      topOverspend: null,
    });

    expect(insight.code).not.toBe('over_budget');
    expect(insight.code).toBe('on_plan');
  });

  it('warns when income is below plan late in the month', () => {
    const insight = rule({
      dayOfMonth: 25,
      daysLeft: 7,
      elapsedPct: 81,
      spentPct: 45,
      monthRealized: { income: 4900, expense: 1000 },
      monthSurplus: 3900,
    });

    expect(insight.code).toBe('income_short');
    expect(insight.title).toBe('Income is below plan');
    expect(insight.subtitle).toBe('¥ 600 less than planned. Adjust this month.');
  });

  it('does not warn when income is exactly 90% of plan', () => {
    const insight = rule({
      dayOfMonth: 25,
      daysLeft: 7,
      elapsedPct: 81,
      spentPct: 45,
      monthRealized: { income: 4950, expense: 1000 },
      monthSurplus: 3950,
    });

    expect(insight.code).not.toBe('income_short');
  });

  it('does not warn about income before day 20', () => {
    const insight = rule({
      dayOfMonth: 19,
      daysLeft: 12,
      elapsedPct: 61,
      spentPct: 45,
      monthRealized: { income: 0, expense: 1000 },
      monthSurplus: -1000,
    });

    expect(insight.code).not.toBe('income_short');
  });

  it('names an over-plan category when the month is under overall', () => {
    const insight = rule({
      monthRealized: { income: 5500, expense: 2000 },
      topOverspend: { label: 'Food', planned: 500, actual: 800, delta: 300 },
    });

    expect(insight.code).toBe('category_over');
    expect(insight.title).toBe('Food is over plan');
    expect(insight.subtitle).toBe('¥ 300 over, but you are ¥ 200 under overall.');
  });

  it('truncates a long category label in the title', () => {
    const insight = rule({
      monthRealized: { income: 5500, expense: 2000 },
      topOverspend: {
        label: 'Salary (paid to employees)',
        planned: 500,
        actual: 800,
        delta: 300,
      },
    });

    expect(insight.code).toBe('category_over');
    expect(insight.title).toContain('…');
    expect(insight.title.length).toBeLessThanOrEqual(40);
  });

  it('warns when spending is 10 points ahead of the month', () => {
    const insight = rule({ spentPct: 58, elapsedPct: 48 });

    expect(insight.code).toBe('fast_pace');
    expect(insight.title).toBe('Spending is a little fast');
    expect(insight.subtitle).toBe('Hold variable spending to ¥ 71 a day.');
  });

  it('does not warn when spending is 9 points ahead of the month', () => {
    const insight = rule({ spentPct: 57, elapsedPct: 48 });

    expect(insight.code).not.toBe('fast_pace');
  });

  it('uses total spending in the pace copy when no variable plan exists', () => {
    const insight = rule({ spentPct: 58, elapsedPct: 48, paceBasis: 'total' });

    expect(insight.code).toBe('fast_pace');
    expect(insight.subtitle).toBe('Hold spending to ¥ 71 a day.');
  });

  it('does not warn about pace before day 7', () => {
    const insight = rule({ dayOfMonth: 6, daysLeft: 25, spentPct: 60, elapsedPct: 19 });

    expect(insight.code).not.toBe('fast_pace');
  });

  it('asks for a goal during the first 10 days', () => {
    const insight = rule({ goal: '', dayOfMonth: 5, elapsedPct: 16, spentPct: 20 });

    expect(insight.code).toBe('no_goal');
    expect(insight.title).toBe('What do you want this month?');
    expect(insight.subtitle).toBe('Write your goal in Planning.');
  });

  it('treats a whitespace goal as empty', () => {
    const insight = rule({ goal: '   ', dayOfMonth: 5, elapsedPct: 16, spentPct: 20 });

    expect(insight.code).toBe('no_goal');
  });

  it('stops asking for a goal after day 10', () => {
    const insight = rule({ goal: '', dayOfMonth: 11, elapsedPct: 35, spentPct: 44 });

    expect(insight.code).toBe('on_plan');
  });

  it('reflects on a month that is nearly over', () => {
    const insight = rule({
      dayOfMonth: 30,
      daysLeft: 2,
      elapsedPct: 97,
      spentPct: 91,
      monthRealized: { income: 5500, expense: 2000 },
    });

    expect(insight.code).toBe('month_closed');
    expect(insight.title).toBe('October is nearly over');
    expect(insight.subtitle).toBe('You spent ¥ 2,000, ¥ 200 under plan.');
  });

  it('says right on plan when the month closes exactly at the plan', () => {
    const insight = rule({
      dayOfMonth: 30,
      daysLeft: 2,
      elapsedPct: 97,
      spentPct: 100,
      monthRealized: { income: 5500, expense: 2200 },
      budgetLeft: 0,
    });

    expect(insight.code).toBe('month_closed');
    expect(insight.subtitle).toBe('You spent ¥ 2,200, right on plan.');
  });

  it('does not close the month with 3 days left', () => {
    const insight = rule({
      dayOfMonth: 28,
      daysLeft: 3,
      elapsedPct: 90,
      spentPct: 91,
      monthRealized: { income: 5500, expense: 2000 },
    });

    expect(insight.code).not.toBe('month_closed');
  });

  it('celebrates a met plan after day 20', () => {
    const insight = rule({
      dayOfMonth: 25,
      daysLeft: 7,
      elapsedPct: 81,
      spentPct: 82,
      monthRealized: { income: 6000, expense: 1800 },
      monthSurplus: 4200,
    });

    expect(insight.code).toBe('plan_met');
    expect(insight.title).toBe('You met your plan');
    expect(insight.subtitle).toBe('You kept ¥ 4,200. Move it to savings.');
  });

  it('does not celebrate a met plan before day 20', () => {
    const insight = rule({
      dayOfMonth: 19,
      daysLeft: 12,
      elapsedPct: 61,
      spentPct: 62,
      monthRealized: { income: 6000, expense: 1800 },
      monthSurplus: 4200,
    });

    expect(insight.code).toBe('on_plan');
  });

  it('praises a positive month that did not meet the plan', () => {
    const insight = rule({
      dayOfMonth: 25,
      daysLeft: 7,
      elapsedPct: 81,
      spentPct: 82,
      monthRealized: { income: 5000, expense: 1800 },
      monthSurplus: 3200,
    });

    expect(insight.code).toBe('positive');
    expect(insight.title).toBe("You're doing great!");
    expect(insight.subtitle).toBe('You kept ¥ 3,200 this month.');
  });

  it('shows the plan on a calm mid-month day', () => {
    const insight = rule();

    expect(insight.code).toBe('on_plan');
    expect(insight.title).toBe('You are on plan');
    expect(insight.subtitle).toBe('¥ 1,200 left for 17 days.');
  });

  it('shows the plan for a future month', () => {
    const insight = rule({
      isCurrentMonth: false,
      dayOfMonth: 0,
      daysLeft: 31,
      elapsedPct: 0,
      spentPct: 0,
      entryCountThisMonth: 0,
      monthRealized: { income: 0, expense: 0 },
    });

    expect(insight.code).toBe('on_plan');
  });

  it('keeps every title and subtitle inside the copy limits', () => {
    const cases = [
      rule({ hasPlan: false, monthPlanned: { income: 0, expense: 0 }, entryCountThisMonth: 0 }),
      rule({ entryCountThisMonth: 0 }),
      rule({
        monthRealized: { income: 2000, expense: 2400 },
        monthSurplus: -400,
        topOverspend: { label: 'Outsourcing/ Freelancers', planned: 100, actual: 400, delta: 300 },
      }),
      rule({
        monthRealized: { income: 2000000, expense: 2400 },
        monthSurplus: 1997600,
        topOverspend: { label: 'Food', planned: 500, actual: 800, delta: 300 },
      }),
      rule({
        dayOfMonth: 25,
        daysLeft: 7,
        elapsedPct: 81,
        spentPct: 45,
        monthRealized: { income: 1, expense: 1000 },
      }),
      rule({
        monthRealized: { income: 5500, expense: 2000 },
        topOverspend: { label: 'Salary (paid to employees)', planned: 100, actual: 400, delta: 300 },
      }),
      rule({ spentPct: 58, elapsedPct: 48 }),
      rule({ goal: '', dayOfMonth: 5, elapsedPct: 16, spentPct: 20 }),
      rule({ dayOfMonth: 30, daysLeft: 2, elapsedPct: 97, spentPct: 91 }),
      rule({
        dayOfMonth: 25,
        daysLeft: 7,
        elapsedPct: 81,
        spentPct: 82,
        monthRealized: { income: 6000, expense: 1800 },
        monthSurplus: 4200,
      }),
      rule({
        dayOfMonth: 25,
        daysLeft: 7,
        elapsedPct: 81,
        spentPct: 82,
        monthRealized: { income: 5000, expense: 1800 },
        monthSurplus: 3200,
      }),
      rule(),
    ];

    for (const insight of cases) {
      expect(insight.title.length, `${insight.code} title`).toBeLessThanOrEqual(40);
      expect(insight.subtitle.length, `${insight.code} subtitle`).toBeLessThanOrEqual(90);
    }
  });
});

describe('formatCurrency', () => {
  it('rounds to whole yen and uses the dashboard format', () => {
    expect(formatCurrency(0)).toBe('¥ 0');
    expect(formatCurrency(1234)).toBe('¥ 1,234');
    expect(formatCurrency(1234.6)).toBe('¥ 1,235');
    expect(formatCurrency(1234567)).toBe('¥ 1,234,567');
  });
});

describe('getInsight', () => {
  let request;
  let knex;

  beforeAll(async () => {
    const result = await createTestApp();
    request = result.request;
    knex = result.knex;
    await seedBasicData(knex);

    const [budgetId] = await knex('monthly_budgets').insert({
      year: 2025,
      month: 1,
      goal: 'Build the emergency fund',
    });

    await knex('budget_items').insert([
      { budget_id: budgetId, type: 'income', label: 'Salary', amount: 5500 },
      { budget_id: budgetId, type: 'expense', label: 'Rent', amount: 1500, expense_type: 'fixed', group_code: 23 },
      { budget_id: budgetId, type: 'expense', label: 'Food', amount: 500, expense_type: 'variable', group_code: 14 },
      { budget_id: budgetId, type: 'expense', label: 'Transport', amount: 200, expense_type: 'variable', group_code: 11 },
    ]);

    await knex('entries').insert([
      { date: '2025-01-05', description: 'Salary', group: 101, wallet: 1, amount: 5000 },
      { date: '2025-01-10', description: 'Rent', group: 23, wallet: 1, amount: 1500 },
      { date: '2025-01-15', description: 'Food', group: 14, wallet: 1, amount: 800 },
      { date: '2025-01-20', description: 'Transport', group: 11, wallet: 1, amount: 100 },
    ]);

    // March has only a fixed plan; the money goes to an unbudgeted category.
    const [marchBudgetId] = await knex('monthly_budgets').insert({
      year: 2025,
      month: 3,
      goal: 'Watch the side costs',
    });

    await knex('budget_items').insert([
      { budget_id: marchBudgetId, type: 'income', label: 'Sales', amount: 1000 },
      { budget_id: marchBudgetId, type: 'expense', label: 'Rent', amount: 100, expense_type: 'fixed', group_code: 23 },
    ]);

    await knex('entries').insert([
      { date: '2025-03-10', description: 'Business expense', group: 31, wallet: 1, amount: 900 },
    ]);
  });

  afterAll(async () => {
    await destroyTestApp();
  });

  it('aggregates the month and leads with the positive balance', async () => {
    const insight = await getInsight(knex, {
      year: 2025,
      month: 1,
      today: dayjs('2025-01-15'),
    });

    expect(insight.code).toBe('wealth');
    expect(insight.subtitle).toBe('You kept ¥ 2,600, even with ¥ 200 over plan.');
  });

  it('names an unbudgeted variable category when it causes the overspend', async () => {
    const insight = await getInsight(knex, {
      year: 2025,
      month: 3,
      today: dayjs('2025-03-15'),
    });

    expect(insight.code).toBe('over_budget');
    expect(insight.subtitle).toBe('You are ¥ 800 over. Check Business expenses.');
  });

  it('returns no_plan when the month has no budget', async () => {
    const insight = await getInsight(knex, {
      year: 2025,
      month: 2,
      today: dayjs('2025-02-15'),
    });

    expect(insight.code).toBe('no_plan');
  });

  it('returns the insight over HTTP', async () => {
    // January 2025 is a past month, but the fixture is over its plan, and
    // over_budget does not depend on the calendar. That keeps this stable.
    const res = await request.get('/api/reports/insight?year=2025&month=1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.insight.code).toBe('wealth');
    expect(res.body.insight.title).toBe('You are building wealth');
  });

  it('rejects an invalid year', async () => {
    const res = await request.get('/api/reports/insight?year=abc&month=1');
    expect(res.status).toBe(400);
  });

  it('rejects an invalid month', async () => {
    const res = await request.get('/api/reports/insight?year=2025&month=13');
    expect(res.status).toBe(400);
  });
});
