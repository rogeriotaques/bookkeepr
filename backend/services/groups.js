const { ENTRY_OPERATIONS } = require('@/constants');

exports.getGroups = async (knex, { active }) => {
  const groups = await knex('groups')
    .modify((qb) => {
      if (active) qb.where({ active });
    })
    .select(['*'])
    .orderBy('code', 'asc');

  return groups;
};

exports.saveGroup = async (knex, { id, code, name, operation, active, expense_type }) => {
  if (id) {
    await knex('groups').where({ id }).update({ code, name, operation, active, expense_type });
    return { id };
  }

  const [groupId] = await knex('groups').insert({ code, name, operation, active, expense_type });
  return { id: groupId };
};

exports.deleteGroup = async (knex, { id }) => {
  const deleted = await knex('groups').where({ id }).del();
  return { deleted };
};
