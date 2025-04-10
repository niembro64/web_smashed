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
    win.webContents.openDevTools();
  } else {
    // In production, load from the build directory
    try {
      // First try to load from same directory (packaged app case)
      const indexPath = path.join(__dirname, 'index.html');
      win.loadFile(indexPath);
      console.log('Loading from', indexPath);
    } catch (error) {
      console.error('Error loading index.html:', error);
      // Fallback for dev builds where electron.js is copied to build/
      win.loadFile(path.join(__dirname, 'index.html'));
    }
  }
}

app.whenReady().then(createWindow);

// Handle app close events properly on different OS platforms
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
