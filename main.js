/**
 * BOOKKEEPR
 * Electron App
 */

const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const watcher = fs.watch(path.join(__dirname, 'app', 'src'));

let win;

const createWindow = () => {
  win = new BrowserWindow({
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

watcher.on('change', () => {
  console.info('Changes detected, reloading');

  setTimeout(() => {
    win.reload(); // Debounced reload
  }, 500);
});

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
