/**
 * BOOKKEEPR
 * Electron App
 */

const fs = require('fs');
const path = require('path');
const electron = require('electron');

const { app, BrowserWindow } = electron;

let win;

const createWindow = () => {
  const ratio = 0.9;
  const screenSize = electron.screen.getPrimaryDisplay().workAreaSize;
  const width = Math.round(screenSize.width * ratio);
  const height = Math.round(screenSize.height * ratio);

  // Create the browser window.
  win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  require('./api/main.js')(app.getVersion(), app.getName(), (port) => {
    fs.writeFileSync(path.join(__dirname, 'app', 'dist', 'config.json'), JSON.stringify({ port }));
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
  win = null;
});
