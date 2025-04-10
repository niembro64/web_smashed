const { app, BrowserWindow } = require('electron');
const path = require('path');

// Determine whether we're in development or production
const isDev = !app.isPackaged;

// Enable more detailed logging
console.log('Electron starting up');
console.log('Running in ' + (isDev ? 'development' : 'production') + ' mode');

function createWindow() {
  console.log('Creating electron window');
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000', // Add background color so it's not blank
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });
  
  // Log window creation
  console.log('Window created');

  if (isDev) {
    // In development, load from the React dev server
    console.log('Dev mode: loading from localhost:3000');
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // In production, load from the build directory
    try {
      // First try to load from same directory (packaged app case)
      const indexPath = path.join(__dirname, 'index.html');
      console.log('Production mode: loading from', indexPath);
      win.loadFile(indexPath).catch(e => console.error('loadFile error:', e));
      
      // Add error handler for content loading
      win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load content:', errorCode, errorDescription);
      });
      
      // Listen for page loaded event
      win.webContents.on('did-finish-load', () => {
        console.log('Page loaded successfully');
      });
      
      // Open dev tools to debug loading issues
      win.webContents.openDevTools();
    } catch (error) {
      console.error('Error loading index.html:', error);
      // Fallback for dev builds where electron.js is copied to build/
      const fallbackPath = path.join(__dirname, 'index.html');
      console.log('Trying fallback path:', fallbackPath);
      win.loadFile(fallbackPath).catch(e => console.error('Fallback loadFile error:', e));
      // Open dev tools here too
      win.webContents.openDevTools();
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
