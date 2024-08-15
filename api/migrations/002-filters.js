exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('filters').then((exists) => {
      if (!exists) {
        return knex.schema.createTable('filters', (table) => {
          table.increments('id').primary();
          table.string('title', 60).notNullable().defaultTo('');
          table.string('rule', 255);
          table.text('incomeGroups');
          table.text('incomeWallets');
          table.text('outcomeGroups');
          table.text('outcomeWallets');
          table.integer('active').notNullable().defaultTo(1);
        });
      }
    })
  ]);
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('filters');
};
