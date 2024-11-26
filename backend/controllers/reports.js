const dayjs = require('dayjs');
const { ENTRY_OPERATIONS } = require('@/constants');

exports.getOverviewReport = async (req, res) => {
  const { year } = req.query;

  if (!year || !dayjs(year).isValid()) {
    return res.status(400).json({ success: false, message: 'Invalid year' });
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => `0${month}`.slice(-2));
  const activeGroups = await global.knex('groups').where('active', true).orderBy('code', 'asc');

  const data = {
    income: [],
    outcome: [],
    balance: ['-'], // First element is the label. Not used.
    tax: ['-'], // First element is the label. Not used.
  };

  await Promise.all(
    activeGroups.map(async (group) => {
      const groupCode = `${group.code}`.padStart(2, '0');
      const entry = [`${groupCode} - ${group.name}`];

      await Promise.all(
        months.map(async (month) => {
          const row = await global.knex
            .sum('amount AS amount')
            .from('entries')
            .where({ group: group.code })
            .whereRaw("strftime('%Y-%m', date) = ?", [`${year}-${month}`])
            .first();

          entry.push(row && row.amount ? row.amount : 0);
        })
      );

      data[group.operation] && data[group.operation].push(entry);
    })
  );

  const shouhizei = await global
    .knex('config')
    .where({ key: 'shouhizei' })
    .select('value')
    .first()
    .then((row) => row.value)
    .catch(() => 0);

  const insights = {
    thisYear: { income: 0, outcome: 0 },
    thisMonth: { income: 0, outcome: 0 },
    today: { income: 0, outcome: 0 },
  };

  const now = dayjs();
  const thisMonth = now.month() + 1;

  //
  // Do the math for balance, tax, and insights
  //

  for (income of data.income) {
    for (i = 1; i < income.length; i++) {
      if (!data.balance[i]) data.balance[i] = 0;
      if (!data.tax[i]) data.tax[i] = 0;

      data.balance[i] += Number(income[i]);
      data.tax[i] += Number(income[i]) * shouhizei;

      insights.thisYear.income += Number(income[i]);
      if (i === thisMonth) insights.thisMonth.income += Number(income[i]);
    }
  }

  for (outcome of data.outcome) {
    for (i = 1; i < outcome.length; i++) {
      data.balance[i] -= Number(outcome[i]);
      insights.thisYear.outcome += Number(outcome[i]);
      if (i === thisMonth) insights.thisMonth.outcome += Number(outcome[i]);
    }
  }

  insights.today.income = await global.knex
    .sum('amount AS amount')
    .from('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.INCOME)
    .where('date', dayjs().format('YYYY-MM-DD'))
    .first()
    .then((row) => row.amount ?? 0)
    .catch(() => 0);

  insights.today.outcome = await global.knex
    .sum('amount AS amount')
    .from('entries')
    .innerJoin('groups', 'entries.group', 'groups.code')
    .where('groups.operation', ENTRY_OPERATIONS.EXPENSE)
    .where('date', dayjs().format('YYYY-MM-DD'))
    .first()
    .then((row) => row.amount ?? 0)
    .catch(() => 0);

  res.json({ year, data, insights });
};
