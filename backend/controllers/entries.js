exports.getEntries = async (req, res) => {
  const { year, month } = req.query;
  const entries = await global.knex
    .select(['entries.*', 'groups.name as groupName', 'groups.operation', 'wallets.name as walletName'])
    .from('entries')
    .innerJoin('groups', 'groups.code', 'entries.group')
    .innerJoin('wallets', 'wallets.id', 'entries.wallet')
    .whereRaw(global.knex.raw(`strftime('%Y', entries.date) = '${year}' AND strftime('%m', entries.date) = '${month}'`))
    .orderBy('entries.date', 'asc');

  res.json({ entries });
};

exports.getRecordedYears = async (req, res) => {
  const years = await global
    .knex('entries')
    .select([global.knex.raw('distinct strftime("%Y", date) as year')])
    .orderBy('year', 'desc');

  res.json({ years: years.map(({ year }) => year) });
};

exports.saveEntry = async (req, res) => {
  const { date, description, amount = 0, group, wallet } = req.body;
  const { id } = req.params;

  const parseAmount = (value) => parseFloat(value.replace(/[^0-9.]/g, ''));

  if (id) {
    await global
      .knex('entries')
      .where({ id })
      .update({ date, description, amount: parseAmount(amount), group, wallet });
    return res.json({ success: true });
  }

  const entry = await global.knex('entries').insert({ date, description, amount: parseAmount(amount), group, wallet });
  return res.json({ entry });
};

exports.deleteEntry = async (req, res) => {
  const { id } = req.params;
  await global.knex('entries').where({ id }).del();
  res.json({ success: true });
};
