exports.getSettings = async (req, res) => {
  const config = await global.knex('config').select(['key', 'value']);
  const configObj = {};

  config.forEach((item) => {
    configObj[item.key] = isNaN(item.value) ? item.value : Number(item.value);
  });

  res.json({ config: configObj });
};
