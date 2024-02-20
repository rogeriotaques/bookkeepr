exports.up = async function(knex) {
  await Promise.all([
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

  await knex('groups').insert([
    { code: 8,	name: 'Taxes',	operation: 'outcome' },
    { code: 9,	name: 'Packaging/ Shipping',	operation: 'outcome' },
    { code: 10,	name: 'Water, Electricity, Gas',	operation: 'outcome' },
    { code: 11,	name: 'Transport',	operation: 'outcome' },
    { code: 12,	name: 'Communication',	operation: 'outcome' },
    { code: 13,	name: 'Advertising',	operation: 'outcome' },
    { code: 14,	name: 'Food',	operation: 'outcome' },
    { code: 15,	name: 'Insurance',	operation: 'outcome' },
    { code: 16,	name: 'Maintenance cost',	operation: 'outcome' },
    { code: 17,	name: 'Suppliers',	operation: 'outcome' },
    { code: 18,	name: 'Deprecation',	operation: 'outcome' },
    { code: 19,	name: 'Wellfare',	operation: 'outcome' },
    { code: 20,	name: 'Salary (paid to employees)',	operation: 'outcome' },
    { code: 21,	name: 'Outsourcing/ Freelancers',	operation: 'outcome' },
    { code: 22,	name: 'Interest fee',	operation: 'outcome' },
    { code: 23,	name: 'Rent fee',	operation: 'outcome' },
    { code: 24,	name: 'Loss',	operation: 'outcome' },
    { code: 31,	name: 'Business expenses',	operation: 'outcome' },
    { code: 38,	name: 'Salary (paid to family)',	operation: 'outcome' },
    { code: 101,	name: 'Invoice',	operation: 'income' },
    { code: 100,	name: 'Refund',	operation: 'income' },
    { code: 102,	name: 'Sales',	operation: 'income' }
  ]);

  await knex('wallets').insert([
    { name: 'Credit card' },
    { name: 'Debit card' },
    { name: 'Paypal' },
    { name: 'Bank' },
    { name: 'Cash' },
    { name: 'Point card' }
  ]);

  return true;
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('entries')
    .dropTableIfExists('wallets')
    .dropTableIfExists('groups');
};
