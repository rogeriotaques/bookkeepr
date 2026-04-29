import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const { createTestApp, destroyTestApp, seedBasicData } = require('./utils');

describe('Reports API (Phase 4)', () => {
  let request;
  let knex;

  beforeAll(async () => {
    const result = await createTestApp();
    request = result.request;
    knex = result.knex;
    await seedBasicData(knex);

    // Seed entries for 2025-01
    await knex('entries').insert([
      { date: '2025-01-05', description: 'Salary', group: 101, wallet: 1, amount: 5000 },
      { date: '2025-01-10', description: 'Rent', group: 23, wallet: 1, amount: 1500 },
      { date: '2025-01-15', description: 'Food', group: 14, wallet: 1, amount: 300 },
      { date: '2025-01-20', description: 'Transport', group: 11, wallet: 1, amount: 100 },
    ]);

    // Seed budget for 2025-01
    const [budgetId] = await knex('monthly_budgets').insert({ year: 2025, month: 1 });
    await knex('budget_items').insert([
      { budget_id: budgetId, type: 'income', label: 'Salary', amount: 5500 },
      { budget_id: budgetId, type: 'expense', label: 'Rent', amount: 1500, expense_type: 'fixed', group_code: 23 },
      { budget_id: budgetId, type: 'expense', label: 'Food', amount: 500, expense_type: 'variable', group_code: 14 },
      { budget_id: budgetId, type: 'expense', label: 'Transport', amount: 200, expense_type: 'variable', group_code: 11 },
    ]);
  });

  afterAll(async () => {
    await destroyTestApp();
  });

  describe('GET /api/reports/monthly', () => {
    it('should return 400 for invalid year', async () => {
      const res = await request.get('/api/reports/monthly?year=abc&month=1');
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid month', async () => {
      const res = await request.get('/api/reports/monthly?year=2025&month=13');
      expect(res.status).toBe(400);
    });

    it('should return budget vs actual breakdown', async () => {
      const res = await request.get('/api/reports/monthly?year=2025&month=1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Expense totals
      expect(res.body.budgetTotal).toBe(2200); // 1500 + 500 + 200
      expect(res.body.actualTotal).toBe(1900); // 1500 + 300 + 100
      expect(res.body.progress).toBeCloseTo((1900 / 2200) * 100, 1);

      // Category breakdown
      const rentBreakdown = res.body.breakdown.find((b) => b.group_code === 23);
      expect(rentBreakdown).toBeDefined();
      expect(rentBreakdown.budget).toBe(1500);
      expect(rentBreakdown.actual).toBe(1500);

      const foodBreakdown = res.body.breakdown.find((b) => b.group_code === 14);
      expect(foodBreakdown).toBeDefined();
      expect(foodBreakdown.budget).toBe(500);
      expect(foodBreakdown.actual).toBe(300);
    });

    it('should handle missing budget gracefully', async () => {
      const res = await request.get('/api/reports/monthly?year=2025&month=2');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.budgetTotal).toBe(0);
      expect(res.body.actualTotal).toBe(0);
      expect(res.body.breakdown).toHaveLength(0);
    });
  });

  describe('GET /api/reports (annual)', () => {
    it('should include budget vs actual per month', async () => {
      const res = await request.get('/api/reports?year=2025');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.budgets).toBeDefined();
      expect(res.body.budgets.length).toBeGreaterThanOrEqual(1);

      const january = res.body.budgets.find((b) => b.month === 1);
      expect(january).toBeDefined();
      expect(january.budget).toBe(2200);
      expect(january.actual).toBe(1900);
    });
  });
});
