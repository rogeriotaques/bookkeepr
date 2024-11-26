const { ENTRY_OPERATIONS } = require('@/constants');

exports.getGroups = async (req, res) => {
  const { active } = req.query;
  const groups = await global
    .knex('groups')
    .modify((qb) => {
      if (active) qb.where({ active });
    })
    .select(['*']);
  res.json({ groups });
};

exports.saveGroup = async (req, res) => {
  const { code, name, operation, active } = req.body;
  const { id } = req.params;

  if (!code && isNaN(code)) {
    return res.status(400).json({ success: false, message: 'Invalid code' });
  }

  if (!name) {
    return res.status(400).json({ success: false, message: 'Missing name' });
  } else if (`${name}`.length > 60) {
    return res.status(400).json({ success: false, message: 'Name too long' });
  }

  if (!operation || !Object.values(ENTRY_OPERATIONS).includes(operation)) {
    return res.status(400).json({ success: false, message: 'Missing operation' });
  }

  if (!active || ![0, 1].includes(active)) {
    return res.status(400).json({ success: false, message: 'Invalid active flag' });
  }

  if (id) {
    await global.knex('groups').where({ id }).update({ code, name, operation, active });
    return res.json({ success: true });
  }

  const group = await global.knex('groups').insert({ code, name, operation, active });
  return res.json({ group });
};

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  await global.knex('groups').where({ id }).del();
  res.json({ success: true });
};
