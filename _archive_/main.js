const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 780,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  require('./api/main.js')(app.getVersion(), app.getName(), (port) => {
    win.loadURL(`http://127.0.0.1:${port}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  //if (process.platform !== 'darwin')
  app.quit();
});
