import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const { createTestApp, destroyTestApp, seedBasicData } = require('./utils');

describe('Test Infrastructure', () => {
  let app;
  let request;
  let knex;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    request = result.request;
    knex = result.knex;
    await seedBasicData(knex);
  });

  afterAll(async () => {
    await destroyTestApp();
  });

  it('should create an in-memory database and run migrations', async () => {
    const tables = await knex.select('name').from('sqlite_master').where('type', 'table');
    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain('entries');
    expect(tableNames).toContain('groups');
    expect(tableNames).toContain('wallets');
    expect(tableNames).toContain('config');
    expect(tableNames).not.toContain('filters');
  });

  it('should seed basic data correctly', async () => {
    const groups = await knex('groups').select('*');
    expect(groups.length).toBeGreaterThan(0);

    const config = await knex('config').where({ key: 'usePasswd' }).first();
    expect(config.value).toBe('0');
  });

  it('should respond to API requests', async () => {
    const res = await request.get('/api/groups');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
