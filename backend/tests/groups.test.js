import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const { createTestApp, destroyTestApp, seedBasicData } = require('./utils');

describe('Groups API (Phase 4)', () => {
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

  describe('GET /api/groups', () => {
    it('should include expense_type in response', async () => {
      const res = await request.get('/api/groups');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.groups.length).toBeGreaterThan(0);
      expect(res.body.groups[0]).toHaveProperty('expense_type');
    });
  });

  describe('POST /api/groups', () => {
    it('should create a group with expense_type', async () => {
      const payload = {
        code: 99,
        name: 'Test Fixed',
        operation: 'outcome',
        active: 1,
        expense_type: 'fixed',
      };

      const res = await request.post('/api/groups').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const group = await knex('groups').where({ code: 99 }).first();
      expect(group.expense_type).toBe('fixed');
    });

    it('should allow creating a group without expense_type', async () => {
      const payload = {
        code: 98,
        name: 'Test No Type',
        operation: 'outcome',
        active: 1,
      };

      const res = await request.post('/api/groups').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const group = await knex('groups').where({ code: 98 }).first();
      expect(group.expense_type).toBeNull();
    });

    it('should reject invalid expense_type', async () => {
      const payload = {
        code: 97,
        name: 'Test Invalid',
        operation: 'outcome',
        active: 1,
        expense_type: 'invalid',
      };

      const res = await request.post('/api/groups').send(payload);
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/groups/:id', () => {
    it('should update expense_type on an existing group', async () => {
      const [id] = await knex('groups').insert({
        code: 96,
        name: 'Update Me',
        operation: 'outcome',
        active: 1,
      });

      const res = await request.patch(`/api/groups/${id}`).send({
        code: 96,
        name: 'Update Me',
        operation: 'outcome',
        active: 1,
        expense_type: 'variable',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const group = await knex('groups').where({ id }).first();
      expect(group.expense_type).toBe('variable');
    });
  });
});
