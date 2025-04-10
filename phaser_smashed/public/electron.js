const { app, BrowserWindow } = require('electron');
const path = require('path');

// Determine whether we're in development or production
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      webSecurity: false,
    },
  });

  if (isDev) {
    // In development, load from the React dev server
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'index.html'));
    // Open DevTools temporarily to inspect errors
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);
