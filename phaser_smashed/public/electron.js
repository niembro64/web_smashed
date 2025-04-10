const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Check if we're in development mode without relying on electron-is-dev
const isDev = process.env.NODE_ENV === 'development' || 
              process.env.DEBUG_PROD === 'true' || 
              !app.isPackaged;

// Enable debug logging to help troubleshoot any issues
console.log('App starting with these settings:');
console.log('- isDev:', isDev);
console.log('- App path:', app.getAppPath());
console.log('- __dirname:', __dirname);
console.log('- Platform:', process.platform);
console.log('- Process cwd:', process.cwd());
console.log('- Resources path:', process.resourcesPath || 'Not available');

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
    backgroundColor: '#000000', // Add background color to prevent white flash
    show: false, // Don't show until ready-to-show event
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open dev tools in both dev and production modes during testing
  if (isDev || process.env.DEBUG_PROD === 'true') {
    mainWindow.webContents.openDevTools();
  }

  // Load the index.html of the app.
  if (isDev) {
    // In development mode, load from localhost server
    console.log('Loading from dev server: http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production mode, try several paths to find the index.html file
    let indexPaths = [
      path.join(__dirname, '../build/index.html'),
      path.join(app.getAppPath(), 'build', 'index.html'),
      path.join(process.resourcesPath, 'build', 'index.html'),
      path.join(process.resourcesPath, 'app.asar', 'build', 'index.html'),
      path.join(__dirname, 'build', 'index.html')
    ];
    
    console.log('Possible production paths:');
    indexPaths.forEach((p, i) => console.log(`${i+1}. ${p} (exists: ${fs.existsSync(p)})`));
    
    // Find the first path that exists
    const validPath = indexPaths.find(p => fs.existsSync(p)) || indexPaths[0];
    console.log('Selected path:', validPath, `(exists: ${fs.existsSync(validPath)})`);
    
    const indexUrl = url.format({
      pathname: validPath,
      protocol: 'file:',
      slashes: true
    });
    
    // Try loading the URL
    console.log('Loading URL:', indexUrl);
    mainWindow.loadURL(indexUrl)
      .catch(error => {
        console.error('Failed to load app:', error);
        
        // Try using loadFile as a last resort
        console.log('Trying loadFile instead of loadURL');
        return mainWindow.loadFile(validPath);
      });
  }

  // Remove menu bar in production
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }

  // Add enhanced error handling for page load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    console.error('Failed to load:', errorCode, errorDescription);
    console.error('URL that failed:', validatedURL);
    console.error('Is main frame:', isMainFrame);
    
    // Try alternative loading methods as last resort
    if (!isDev) {
      // List all files in the build directory to help debugging
      try {
        const buildDir = path.join(app.getAppPath(), 'build');
        console.log('Contents of build directory:');
        if (fs.existsSync(buildDir)) {
          fs.readdirSync(buildDir).forEach(file => {
            console.log(`- ${file}`);
          });
        } else {
          console.log('Build directory does not exist:', buildDir);
        }
      } catch (err) {
        console.error('Error listing build directory contents:', err);
      }
      
      // Try a direct file load
      try {
        const lastResortPath = path.join(app.getAppPath(), 'build', 'index.html');
        console.log('Last resort - trying to load from:', lastResortPath);
        
        mainWindow.loadFile(lastResortPath).catch(err => {
          console.error('Last resort load failed:', err);
          
          // Try one more alternative location
          const appRootPath = path.join(__dirname, '..');
          console.log('Checking application root path:', appRootPath);
          
          try {
            fs.readdirSync(appRootPath).forEach(file => {
              console.log(`Root: ${file}`);
            });
          } catch (dirErr) {
            console.error('Error listing root directory:', dirErr);
          }
        });
      } catch (err) {
        console.error('Error in last resort loading:', err);
      }
    }
  });
  
  // Add console logging for debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console][${level}]: ${message}`);
    if (sourceId) {
      console.log(`Source: ${sourceId}:${line}`);
    }
  });

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