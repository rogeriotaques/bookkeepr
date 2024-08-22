exports.getEntries = async (req, res) => {
  const entries = await global.knex
    .from('entries')
    .innerJoin('groups', 'groups.code', 'entries.group')
    .select(['entries.*', 'groups.name as groupName', 'groups.operation'])
    .orderBy('entries.date', 'asc');
  res.json({ entries });
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

// exports.deleteWallet = async (req, res) => {
//   const { id } = req.params;
//   await global.knex('wallets').where({ id }).del();
//   res.json({ success: true });
// };
