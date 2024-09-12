exports.getWallets = async (req, res) => {
  const { active } = req.query;
  const wallets = await global
    .knex('wallets')
    .modify((qb) => {
      if (active) qb.where({ active });
    })
    .select(['*']);
  res.json({ wallets });
};

exports.saveWallet = async (req, res) => {
  const { name, active } = req.body;
  const { id } = req.params;

  if (id) {
    await global.knex('wallets').where({ id }).update({ name, active });
    return res.json({ success: true });
  }

  const wallet = await global.knex('wallets').insert({ name, active });
  return res.json({ wallet });
};

exports.deleteWallet = async (req, res) => {
  const { id } = req.params;
  await global.knex('wallets').where({ id }).del();
  res.json({ success: true });
};
