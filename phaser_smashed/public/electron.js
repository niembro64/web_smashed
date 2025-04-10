const { app, BrowserWindow } = require('electron');
const path = require('path');

// Determine whether we're in development or production
const isDev = !app.isPackaged;

// Enable more detailed logging
console.log('Electron starting up');
console.log('Running in ' + (isDev ? 'development' : 'production') + ' mode');

function createWindow() {
  console.log('Creating electron window');
  
  // Fix for Windows Electron: Check and create common app data directory
  // to avoid permission issues
  const appDataPath = app.getPath('appData');
  console.log('App data path:', appDataPath);
  
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000', // Add background color so it's not blank
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      // Add preload script path if needed later
    },
    show: false, // Don't show until loaded
  });
  
  // Show window when ready to reduce flashing
  win.once('ready-to-show', () => {
    console.log('Window ready to show');
    win.show();
  });
  
  // Log window creation
  console.log('Window created');

  // Set up error handlers for all load scenarios
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load content:', errorCode, errorDescription);
  });
  
  // Listen for page loaded event
  win.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  if (isDev) {
    // In development, load from the React dev server
    console.log('Dev mode: loading from localhost:3000');
    win.loadURL('http://localhost:3000')
      .catch(err => {
        console.error('Failed to load from dev server:', err);
      });
    win.webContents.openDevTools();
  } else {
    // In production, load from the build directory
    try {
      let indexPath;
      
      // Windows & Mac have different path behaviors in packaged apps
      if (process.platform === 'win32') {
        // Windows path - might need resources/app/build/
        const possiblePaths = [
          path.join(__dirname, 'index.html'),
          path.join(process.resourcesPath, 'app', 'build', 'index.html'),
          path.join(__dirname, '..', 'index.html')
        ];
        
        for (const possiblePath of possiblePaths) {
          console.log('Checking if file exists:', possiblePath);
          try {
            if (require('fs').existsSync(possiblePath)) {
              indexPath = possiblePath;
              console.log('Found index.html at:', indexPath);
              break;
            }
          } catch (fsErr) {
            console.error('Error checking path:', fsErr);
          }
        }
        
        if (!indexPath) {
          indexPath = path.join(__dirname, 'index.html'); // Default fallback
          console.log('Using default path as fallback:', indexPath);
        }
      } else {
        // Mac path - standard
        indexPath = path.join(__dirname, 'index.html');
      }
      
      console.log('Production mode: loading from', indexPath);
      win.loadFile(indexPath)
        .catch(e => console.error('loadFile error:', e));
      
      // Open dev tools to debug loading issues in production
      // You can comment this out in the final version
      win.webContents.openDevTools();
    } catch (error) {
      console.error('Error loading index.html:', error);
      
      // Last resort - try to load from the current directory
      try {
        console.log('Trying to load index.html with no path');
        win.loadFile('index.html').catch(e => console.error('Final fallback error:', e));
      } catch (finalError) {
        console.error('All loading attempts failed:', finalError);
      }
      
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
