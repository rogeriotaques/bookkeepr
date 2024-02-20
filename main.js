/**
 * BOOKKEEPR
 * Electron App
 */

const path = require('path');
const { app, BrowserWindow } = require('electron');
const reload = require('electron-reload');

// Live reload for electron app and content
reload(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`),
});

const createWindow = () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1280,
    height: 780,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  require('./api/main.js')(app.getVersion(), app.getName(), (port) => {
    win.loadURL(`http://127.0.0.1:${port}`);
    console.info('Electron app running');
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  app.quit();
});
