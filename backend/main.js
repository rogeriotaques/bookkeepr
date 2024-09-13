/**
 * BOOKKEEPR
 * API
 */

require('module-alias/register');

const args = process.argv.slice(1);
const fs = require('fs');
const path = require('path');
const express = require('express');
const parser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

global.app = express();
global.knex = null;
global.appVersion = null;
global.appName = null;
global.pathToDb = null;

// Database file will be created either at
// ./api/data/bookkeepr.db
const createDatabase = async () => {
  const pathToDataDir = path.join(__dirname, '..', 'data');

  if (!fs.existsSync(pathToDataDir)) {
    fs.mkdirSync(pathToDataDir);
    console.info('Data directory created');
  }

  pathToDb = path.join(pathToDataDir, 'bookkeepr.db');

  if (!fs.existsSync(pathToDb)) {
    fs.writeFileSync(pathToDb, '');
    console.info('Empty database created');
  }

  knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: pathToDb,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    },
    useNullAsDefault: true,
  });

  await knex.migrate.latest();
  console.info('Database migrated');
};

const startServer = async (version = 'devel', name = 'BookKeepr') => {
  appVersion = version;
  appName = name;

  // Enable CORS to accept requests from any origin
  app.use(cors({ origin: '*', credentials: true }));
  // Enable Helmet with contentSecurityPolicy disabled
  app.use(helmet({ contentSecurityPolicy: false }));

  // To support URL-encoded bodies
  app.use(
    parser.urlencoded({
      extended: true,
    })
  );

  // To support JSON bodies
  app.use(parser.json());

  // Compress all routes
  app.use(compression());

  // Public directory
  // app.use(express.static(path.join(__dirname, 'public')));
  app.use('/', express.static(path.join(__dirname, '..', 'frontend', 'dist')));

  // Routes
  app.use('/api', require('@/routes'));

  try {
    createDatabase();

    const port = 8083;

    app.listen(port, () => {
      console.info(`Server started at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server', error);
  }
};

// Prevents running the server twice when in Electron.
// When running on browser, as a Node process, then starts the server here.
if (args.length && args[0] != '.') {
  console.info('Running on a Browser, starting server now...');
  startServer();
}

module.exports = startServer;
