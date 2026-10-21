exports.up = async function (knex) {
  await knex.schema.alterTable('groups', (table) => {
    table.string('expense_type', 10).nullable().checkIn(['fixed', 'variable']);
  });

  await knex.schema.createTable('monthly_budgets', (table) => {
    table.increments('id').primary();
    table.integer('year').notNullable();
    table.integer('month').notNullable();
    table.string('goal', 255).nullable().defaultTo('');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.unique(['year', 'month']);
  });

  await knex.schema.createTable('budget_items', (table) => {
    table.increments('id').primary();
    table.integer('budget_id').notNullable().references('id').inTable('monthly_budgets').onDelete('CASCADE');
    table.string('type', 10).notNullable().checkIn(['income', 'expense']);
    table.string('label', 255).notNullable().defaultTo('');
    table.integer('group_code').nullable();
    table.float('amount').notNullable().defaultTo(0.0);
    table.string('expense_type', 10).nullable().checkIn(['fixed', 'variable']);
    table.integer('sort_order').notNullable().defaultTo(0);
  });

  await knex.schema.dropTableIfExists('filters');

  // Update seed data: classify default outcome groups
  const fixedExpenses = [
    'Rent fee',
    'Insurance',
    'Deprecation',
    'Salary (paid to employees)',
    'Salary (paid to family)',
    'Taxes',
    'Interest fee',
    'Water, Electricity, Gas',
  ];

  const variableExpenses = [
    'Food',
    'Transport',
    'Communication',
    'Advertising',
    'Maintenance cost',
    'Suppliers',
    'Packaging/ Shipping',
    'Wellfare',
    'Outsourcing/ Freelancers',
    'Business expenses',
    'Loss',
  ];

  await knex('groups')
    .whereIn('name', fixedExpenses)
    .update({ expense_type: 'fixed' });

  await knex('groups')
    .whereIn('name', variableExpenses)
    .update({ expense_type: 'variable' });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('budget_items');
  await knex.schema.dropTableIfExists('monthly_budgets');

  await knex.schema.alterTable('groups', (table) => {
    table.dropColumn('expense_type');
  });

  // Recreate filters table (for rollback compatibility)
  const hasTable = await knex.schema.hasTable('filters');
  if (!hasTable) {
    await knex.schema.createTable('filters', (table) => {
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
};
