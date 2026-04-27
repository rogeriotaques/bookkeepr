const withTransaction = async (fn) => {
  return global.knex.transaction(fn);
};

module.exports = { withTransaction };
