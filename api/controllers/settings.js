exports.getSettings = async (req, res) => {
  const config = await global.knex('config').select(['key', 'value']);
  const configObj = {};

  config.forEach((item) => {
    configObj[item.key] = item.value;
  });

  res.json({ config: configObj, pathToDb: global.pathToDb });
};
