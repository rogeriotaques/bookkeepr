const groupsService = require('@/services/groups');
const groupsSerializer = require('@/serializers/groups');

exports.getGroups = async (req, res) => {
  const { active } = req.query;
  const groups = await groupsService.getGroups(global.knex, { active });
  res.json({ success: true, groups: groupsSerializer.serializeGroups(groups) });
};

exports.saveGroup = async (req, res) => {
  const { code, name, operation, active, expense_type } = req.body;
  const { id } = req.params;

  const result = await groupsService.saveGroup(global.knex, {
    id,
    code,
    name,
    operation,
    active,
    expense_type,
  });

  if (id) {
    res.json({ success: true });
  } else {
    res.json({ success: true, group: result });
  }
};

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  await groupsService.deleteGroup(global.knex, { id });
  res.json({ success: true });
};
