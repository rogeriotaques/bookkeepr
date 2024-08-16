exports.getGroups = async (req, res) => {
  const groups = await global.knex('groups').select(['*']);
  res.json({ groups });
};

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  await global.knex('groups').where({ id }).del();
  res.json({ success: true });
};
