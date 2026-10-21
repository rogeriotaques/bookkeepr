import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const { createTestApp, destroyTestApp } = require('./utils');

describe('Migration 004', () => {
  let knex;

  beforeAll(async () => {
    const result = await createTestApp();
    knex = result.knex;
  });

  afterAll(async () => {
    await destroyTestApp();
  });

  it('should add expense_type column to groups', async () => {
    const hasColumn = await knex.schema.hasColumn('groups', 'expense_type');
    expect(hasColumn).toBe(true);
  });

  it('should create monthly_budgets table', async () => {
    const hasTable = await knex.schema.hasTable('monthly_budgets');
    expect(hasTable).toBe(true);
  });

  it('should create budget_items table', async () => {
    const hasTable = await knex.schema.hasTable('budget_items');
    expect(hasTable).toBe(true);
  });

  it('should drop filters table', async () => {
    const hasTable = await knex.schema.hasTable('filters');
    expect(hasTable).toBe(false);
  });

  it('should seed default groups with expense_type', async () => {
    const rent = await knex('groups').where({ name: 'Rent fee' }).first();
    expect(rent.expense_type).toBe('fixed');

    const food = await knex('groups').where({ name: 'Food' }).first();
    expect(food.expense_type).toBe('variable');

    const invoice = await knex('groups').where({ name: 'Invoice' }).first();
    expect(invoice.expense_type).toBeNull();
  });

  it('should enforce unique year+month on monthly_budgets', async () => {
    await knex('monthly_budgets').insert({ year: 2025, month: 1 });
    
    // Attempt duplicate should fail
    await expect(
      knex('monthly_budgets').insert({ year: 2025, month: 1 })
    ).rejects.toThrow();
  });

  it('should allow budget_items with valid types', async () => {
    const [budgetId] = await knex('monthly_budgets').insert({ year: 2025, month: 2 });

    await knex('budget_items').insert({
      budget_id: budgetId,
      type: 'income',
      label: 'Salary',
      amount: 1000,
    });

    await knex('budget_items').insert({
      budget_id: budgetId,
      type: 'expense',
      label: 'Rent',
      amount: 500,
      expense_type: 'fixed',
    });

    const items = await knex('budget_items').where({ budget_id: budgetId });
    expect(items).toHaveLength(2);
  });

  it('should reject invalid budget_items type', async () => {
    const [budgetId] = await knex('monthly_budgets').insert({ year: 2025, month: 3 });

    await expect(
      knex('budget_items').insert({
        budget_id: budgetId,
        type: 'invalid',
        label: 'Bad',
        amount: 100,
      })
    ).rejects.toThrow();
  });
});
