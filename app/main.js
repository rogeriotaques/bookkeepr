
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
// - ./app/bookkeepr.db
// - ~/Library/Application Support/BookKeepr/bookkeepr.db"
function createDatabase () {
  let userDataPath = __dirname;

  if (electron.app) userDataPath = electron.app.getPath('userData');
  if (electron.remote) userDataPath = electron.remote.app.getPath('userData');

  pathToDb = path.join(userDataPath, 'bookkeepr.db');
  app.locals.pathToDb = pathToDb;

  if (!fs.existsSync(pathToDb)) {
    fs.writeFileSync(pathToDb, '');
    console.info('Empty database file created');
  }
}

const startServer = async (version = 'devel', name = 'bookkeepr', callback = null) => {
  const port = !callback ? 8083 : 0
  const pathToDb = path.join(__dirname, 'bookkeepr.db');

  appVersion = version;
  appName = name;

  // To support URL-encoded bodies
  app.use(
    parser.urlencoded({
      extended: true
    })
  );

  // Compress all routes
  app.use(compression());

  // View engine
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
  app.set('views', path.join(__dirname, 'views'));

  // Public directory
  app.use(express.static(path.join(__dirname, '..', 'app', 'public')));

  // Routes
  app.use('/', require('./routes'));

  try {
    // Create database, if needed.
    createDatabase();

    // Initialize SQLITE database
    knex = require('knex')({
      client: 'sqlite3',
      connection: {
        filename: pathToDb
      },
      migrations: {
        directory: path.join(__dirname, '..', 'migrations'),
      },
      useNullAsDefault: true
    });

    console.info('Connected to the database');

    console.info('Migrating the database');
    await knex.migrate.latest();
    console.info('Migrations applied');

    const server = app.listen(port, () => {
      console.info(`Server listening on http://127.0.0.1:${port}`);

      if (callback && typeof callback === 'function') {
        callback(port ? port : server.address().port);
      }
    });

  } catch (error) {
    console.error('Not possible to start server', error);
    process.exit(1);
  }

};

// Helps prevent running the server twice when in Electron.
// When running on browser, as a Node process, then starts the server here.
if (args.length && args[0] != '.') {
  console.info('Looks like we are running in Browser, starting server');
  startServer();
}

module.exports = startServer;
