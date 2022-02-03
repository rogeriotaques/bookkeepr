const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow () {
  const port = 2345;

  const win = new BrowserWindow({
    width: 1280,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  require('./app/main.js')(port, app.getVersion(), app.getName(), () => {
    win.loadURL(`http://localhost:${port}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});

app.on('window-all-closed', function () {
  //if (process.platform !== 'darwin')
  app.quit();
});
