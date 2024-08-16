exports.getWallets = async (req, res) => {
  const wallets = await global.knex('wallets').select(['*']);
  res.json({ wallets });
};

exports.deleteWallet = async (req, res) => {
  const { id } = req.params;
  await global.knex('wallets').where({ id }).del();
  res.json({ success: true });
};
