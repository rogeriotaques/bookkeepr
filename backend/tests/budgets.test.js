import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const { createTestApp, destroyTestApp, seedBasicData } = require('./utils');

describe('Budgets API', () => {
  let request;
  let knex;

  beforeAll(async () => {
    const result = await createTestApp();
    request = result.request;
    knex = result.knex;
    await seedBasicData(knex);
  });

  afterAll(async () => {
    await destroyTestApp();
  });

  describe('GET /api/budgets', () => {
    it('should return 400 when year or month is missing', async () => {
      const res = await request.get('/api/budgets');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid year/month', async () => {
      const res = await request.get('/api/budgets?year=abc&month=13');
      expect(res.status).toBe(400);
    });

    it('should return null budget when none exists for the month', async () => {
      const res = await request.get('/api/budgets?year=2025&month=1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.budget).toBeNull();
    });

    it('should return budget with items when one exists', async () => {
      const [budgetId] = await knex('monthly_budgets').insert({ year: 2025, month: 1, goal: 'Save money' });
      await knex('budget_items').insert([
        { budget_id: budgetId, type: 'income', label: 'Salary', amount: 5000 },
        { budget_id: budgetId, type: 'expense', label: 'Rent', amount: 1500, expense_type: 'fixed', group_code: 23 },
      ]);

      const res = await request.get('/api/budgets?year=2025&month=1');
      expect(res.status).toBe(200);
      expect(res.body.budget.id).toBe(budgetId);
      expect(res.body.budget.goal).toBe('Save money');
      expect(res.body.items).toHaveLength(2);
    });
  });

  describe('POST /api/budgets', () => {
    it('should create a budget with items', async () => {
      const payload = {
        year: 2025,
        month: 2,
        goal: 'Build emergency fund',
        items: [
          { type: 'income', label: 'Salary', amount: 5000 },
          { type: 'expense', label: 'Rent', amount: 1500, expense_type: 'fixed', group_code: 23 },
          { type: 'expense', label: 'Food', amount: 600, expense_type: 'variable', group_code: 14 },
        ],
      };

      const res = await request.post('/api/budgets').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.budget).toBeDefined();

      const budgetId = res.body.budget.id;
      const items = await knex('budget_items').where({ budget_id: budgetId });
      expect(items).toHaveLength(3);
    });

    it('should return 400 for invalid year', async () => {
      const payload = {
        year: 'abc',
        month: 2,
        goal: '',
        items: [],
      };
      const res = await request.post('/api/budgets').send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid month', async () => {
      const payload = {
        year: 2025,
        month: 13,
        goal: '',
        items: [],
      };
      const res = await request.post('/api/budgets').send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 400 for negative amount in items', async () => {
      const payload = {
        year: 2025,
        month: 3,
        goal: '',
        items: [{ type: 'income', label: 'Bad', amount: -100 }],
      };
      const res = await request.post('/api/budgets').send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid item type', async () => {
      const payload = {
        year: 2025,
        month: 3,
        goal: '',
        items: [{ type: 'other', label: 'Bad', amount: 100 }],
      };
      const res = await request.post('/api/budgets').send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 400 when group_code does not reference an active outcome group for expense', async () => {
      const payload = {
        year: 2025,
        month: 3,
        goal: '',
        items: [{ type: 'expense', label: 'Bad', amount: 100, group_code: 99999 }],
      };
      const res = await request.post('/api/budgets').send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 400 for duplicate year+month', async () => {
      const payload = {
        year: 2025,
        month: 4,
        goal: '',
        items: [],
      };
      const res1 = await request.post('/api/budgets').send(payload);
      expect(res1.status).toBe(200);

      const res2 = await request.post('/api/budgets').send(payload);
      expect(res2.status).toBe(400);
    });
  });

  describe('PUT /api/budgets/:id', () => {
    it('should update goal and replace all items', async () => {
      const [budgetId] = await knex('monthly_budgets').insert({ year: 2025, month: 5, goal: 'Old goal' });
      await knex('budget_items').insert([
        { budget_id: budgetId, type: 'income', label: 'Old', amount: 100 },
      ]);

      const payload = {
        goal: 'New goal',
        items: [
          { type: 'income', label: 'New Salary', amount: 6000 },
          { type: 'expense', label: 'New Rent', amount: 1600, expense_type: 'fixed', group_code: 23 },
        ],
      };

      const res = await request.put(`/api/budgets/${budgetId}`).send(payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const budget = await knex('monthly_budgets').where({ id: budgetId }).first();
      expect(budget.goal).toBe('New goal');

      const items = await knex('budget_items').where({ budget_id: budgetId });
      expect(items).toHaveLength(2);
      expect(items.map((i) => i.label)).toContain('New Salary');
      expect(items.map((i) => i.label)).not.toContain('Old');
    });

    it('should return 404 for non-existent budget', async () => {
      const res = await request.put('/api/budgets/99999').send({ goal: 'x', items: [] });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete budget and cascade items', async () => {
      const [budgetId] = await knex('monthly_budgets').insert({ year: 2025, month: 6 });
      await knex('budget_items').insert([
        { budget_id: budgetId, type: 'income', label: 'Temp', amount: 100 },
      ]);

      const res = await request.delete(`/api/budgets/${budgetId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const budget = await knex('monthly_budgets').where({ id: budgetId }).first();
      expect(budget).toBeUndefined();

      const items = await knex('budget_items').where({ budget_id: budgetId });
      expect(items).toHaveLength(0);
    });

    it('should return 404 for non-existent budget', async () => {
      const res = await request.delete('/api/budgets/99999');
      expect(res.status).toBe(404);
    });
  });
});
