exports.getGroups = async (req, res) => {
  const groups = await global.knex('groups').select(['*']);
  res.json({ groups });
};

exports.saveGroup = async (req, res) => {
  const { code, name, operation, active } = req.body;
  const { id } = req.params;

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
