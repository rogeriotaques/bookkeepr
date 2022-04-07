exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('config').then((exists) => {
      if (!exists) {
        return knex.schema.createTable('config', (table) => {
          table.increments('id').primary();
          table.string('key', 60).notNullable().defaultTo('');
          table.text('value');
        });
      }
    })
  ]);
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('config');
};
