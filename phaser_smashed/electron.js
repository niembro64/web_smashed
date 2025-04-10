// electron.js
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
    },
  });

  if (isDev) {
    // In development, load from the React dev server
    win.loadURL('http://localhost:3000');
  } else {
    // In production, load the built React files from the "build" folder
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

app.whenReady().then(createWindow);
