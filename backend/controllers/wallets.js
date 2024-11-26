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

  if (!name) {
    return res.status(400).json({ success: false, message: 'Missing name' });
  } else if (`${name}`.length > 60) {
    return res.status(400).json({ success: false, message: 'Name too long' });
  }

  if (!active || ![0, 1].includes(active)) {
    return res.status(400).json({ success: false, message: 'Invalid active flag' });
  }

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
