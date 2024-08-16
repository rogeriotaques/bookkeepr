exports.getSettings = async (req, res) => {
  const config = await global.knex('config').select(['key', 'value']);
  const configObj = {};

  config.forEach((item) => {
    configObj[item.key] = isNaN(item.value) ? item.value : Number(item.value);
  });

  res.json({ config: configObj, dbFilePath: global.pathToDb });
};

exports.setSettings = async (req, res) => {
  const { config } = req.body;

  const row = await global.knex('config').select(['id']).where({ key: config.key }).first();

  if (row) {
    await global.knex('config').where({ id: row.id }).update({ value: config.value });
  } else {
    await global.knex('config').insert({ key: config.key, value: config.value });
  }

  res.json({ success: true });
};

exports.runVacuum = async (req, res) => {
  await global.knex.raw('VACUUM');
  res.json({ success: true });
};
