const fs = require('fs');

const KEY_BLACK_LIST = ['passwd'];

exports.getSettings = async (req, res) => {
  const config = await global.knex('config').select(['key', 'value']);
  const configObj = {};
  let usePasswd = null;

  config.forEach((item) => {
    if ('usePasswd' === item.key && item.value !== null) {
      usePasswd = item.value == 1;
      return;
    }

    if (KEY_BLACK_LIST.includes(item.key)) return;

    configObj[item.key] = isNaN(item.value) ? item.value : Number(item.value);
  });

  // Get database file size in MB
  const stats = fs.statSync(global.pathToDb);
  const dbFileSize = stats.size / 1024 / 1024;

  res.json({ config: { ...configObj, usePasswd }, dbFileSize });
};

exports.setSettings = async (req, res) => {
  const { config } = req.body;

  if (config && KEY_BLACK_LIST.includes(config.key)) {
    return res.json({ success: false, message: 'Invalid key' });
  }

  if (!config.key) {
    return res.status(400).json({ success: false, message: 'Missing key' });
  } else if (`${config.key}`.length > 60) {
    return res.status(400).json({ success: false, message: 'Key too long' });
  }

  if (!config.value) {
    return res.status(400).json({ success: false, message: 'Missing value' });
  } else if (`${config.value}`.length > 255) {
    return res.status(400).json({ success: false, message: 'Value too long' });
  }

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
