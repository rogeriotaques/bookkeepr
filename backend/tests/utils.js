require('module-alias/register');

const express = require('express');
const parser = require('body-parser');
const knex = require('knex');
const supertest = require('supertest');
const path = require('path');

let testKnex = null;

/**
 * Create a test application with an in-memory database.
 * @returns {Promise<{app: Express.Application, knex: Knex, request: supertest.SuperTest}>}
 */
async function createTestApp() {
  // Create in-memory database
  testKnex = knex({
    client: 'sqlite3',
    connection: ':memory:',
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
    },
    useNullAsDefault: true,
  });

  // Run migrations
  await testKnex.migrate.latest();

  // Enable foreign keys for SQLite
  await testKnex.raw('PRAGMA foreign_keys = ON');

  // Set global knex for routes/middleware that depend on it
  global.knex = testKnex;
  global.pathToDb = ':memory:';

  // Create Express app
  const app = express();
  app.use(parser.json());
  app.use(parser.urlencoded({ extended: true }));

  // Mount routes
  app.use('/api', require('@/routes'));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Test Error]', req.method, req.path, message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  const request = supertest(app);

  return { app, knex: testKnex, request };
}

/**
 * Clean up the test database.
 */
async function destroyTestApp() {
  if (testKnex) {
    await testKnex.destroy();
    testKnex = null;
    global.knex = null;
  }
}

/**
 * Seed basic data needed for most tests.
 */
async function seedBasicData(knexInstance) {
  // Seed config to disable password auth by default in tests
  await knexInstance('config').insert([
    { key: 'usePasswd', value: '0' },
    { key: 'passwd', value: '' },
  ]);

  // Default groups are already seeded by migration 001 and updated by 004
  // No need to insert them here to avoid duplicate codes

  // Seed wallets
  await knexInstance('wallets').insert([
    { name: 'Cash', active: 1 },
    { name: 'Bank', active: 1 },
  ]);
}

module.exports = {
  createTestApp,
  destroyTestApp,
  seedBasicData,
};
