exports.up = function(knex) {
  return Promise.all([
    // Entries
    knex.schema.hasTable('entries').then((exists) => {
      if (!exists) {
        return knex.schema.createTable('entries', (table) => {
          table.bigIncrements('id').primary();
          table.date('date').notNullable().defaultTo(knex.fn.now());
          table.string('description', 255).notNullable().defaultTo('');
          table.integer('group').notNullable().defaultTo(0);
          table.integer('wallet').notNullable().defaultTo(0);
          table.float('amount').notNullable().defaultTo(0.0);
        });
      }
    }),

    // Wallets
    knex.schema.hasTable('wallets').then((exists) => {
      if (!exists) {
        return knex.schema.createTable('wallets', (table) => {
          table.increments('id').primary();
          table.string('name', 60).notNullable().defaultTo('');
          table.integer('active').notNullable().defaultTo(1);
        });
      }
    }),

    // Groups
    knex.schema.hasTable('groups').then((exists) => {
      if (!exists) {
        return knex.schema.createTable('groups', (table) => {
          table.increments('id').primary();
          table.integer('code').notNullable().defaultTo(0);
          table.string('name', 60).notNullable().defaultTo('');
          table.string('operation', 15).notNullable().defaultTo('income');
          table.integer('active').notNullable().defaultTo(1);
        });
      }
    })
  ]);
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('entries')
    .dropTableIfExists('wallets')
    .dropTableIfExists('groups');
};
