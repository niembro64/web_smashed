const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

// Initialize Steamworks if in production
let steamworks = null;
if (!isDev) {
  try {
    // Dynamically import steamworks.js in production
    steamworks = require('steamworks.js');
    
    // Initialize with your Steam App ID
    const client = steamworks.init(1234567); // Replace with your actual Steam App ID
    
    console.log('Steam client initialized successfully');
    
    // Example: Set achievement
    // client.achievement.activate('ACHIEVEMENT_NAME');
  } catch (err) {
    console.error('Failed to initialize Steam client:', err);
  }
}

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Remove menu bar in production
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }

  // Open the DevTools automatically in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle IPC messages from renderer
ipcMain.on('save-screenshot', (event, dataUrl) => {
  try {
    const downloadsPath = app.getPath('downloads');
    const fileName = `Smashed_Screenshot_${new Date().toISOString().replace(/:/g, '-')}.png`;
    const filePath = path.join(downloadsPath, fileName);
    
    // Remove header from data URL and convert to buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(filePath, buffer);
    event.reply('screenshot-saved', { success: true, path: filePath });
  } catch (error) {
    console.error('Failed to save screenshot:', error);
    event.reply('screenshot-saved', { success: false, error: error.message });
  }
});

// For Steam achievements
ipcMain.on('unlock-achievement', (event, achievementName) => {
  if (steamworks && steamworks.client) {
    try {
      steamworks.client.achievement.activate(achievementName);
      event.reply('achievement-unlocked', { success: true, name: achievementName });
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      event.reply('achievement-unlocked', { success: false, error: error.message });
    }
  } else {
    event.reply('achievement-unlocked', { success: false, error: 'Steam client not initialized' });
  }
});