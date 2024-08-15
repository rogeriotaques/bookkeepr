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
const electron = require('electron');

global.app = express();
global.knex = null;
global.appVersion = null;
global.appName = null;
global.pathToDb = null;

// Database file will be created either at
// - ./api/bookkeepr.db
// - ~/Library/Application Support/BookKeepr/bookkeepr.db"
const createDatabase = async () => {
  let userDataPath = __dirname;

  if (electron.app) userDataPath = electron.app.getPath('userData');
  if (electron.remote) userDataPath = electron.remote.app.getPath('userData');

  pathToDb = path.join(userDataPath, 'bookkeepr.db');

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

const startServer = async (version = 'devel', name = 'BookKeepr', callback = null) => {
  const port = !callback ? 8083 : 0;

  appVersion = version;
  appName = name;

  // To support URL-encoded bodies
  app.use(
    parser.urlencoded({
      extended: true,
    })
  );

  // Compress all routes
  app.use(compression());

  // Public directory
  // app.use(express.static(path.join(__dirname, 'public')));
  app.use('/', express.static(path.join(__dirname, '..', 'app', 'dist')));

  // Routes
  app.use('/api/v1', require('@/routes'));

  try {
    createDatabase();

    const server = app.listen(port, () => {
      const port = server.address().port;
      console.info(`Server started at http://127.0.0.1:${port}`);
      if (callback) callback(port);
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
