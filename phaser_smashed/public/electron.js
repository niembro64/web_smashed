const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Determine whether we're in development or production
const isDev = !app.isPackaged;

// Enable more detailed logging
console.log('Electron starting up');
console.log('Running in ' + (isDev ? 'development' : 'production') + ' mode');

function createWindow() {
  console.log('Creating electron window');
  
  // Fix for Windows Electron: Check and create common app data directory
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
    }
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
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // In production, load a static HTML file directly without any JavaScript
    const staticHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Smashed - Loading Test</title>
          <style>
            body {
              background-color: #222;
              color: white;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 0;
              text-align: center;
            }
            h1 { color: #ff0; margin-bottom: 20px; }
            p { margin: 10px 0; }
            .info { font-size: 14px; color: #aaa; margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>Smashed</h1>
          <p>If you can see this page, Electron is working correctly.</p>
          <p>This is a static HTML page loaded directly from electron.js.</p>
          <p>The next step is to load the actual game content.</p>
          <div class="info">
            <p>App Path: ${app.getAppPath()}</p>
            <p>Resources Path: ${process.resourcesPath}</p>
          </div>
        </body>
      </html>
    `;
    
    // Create a temp file in a location we know we can write to
    const tempHtmlPath = path.join(app.getPath('userData'), 'smashed-test.html');
    console.log('Creating temp HTML file at:', tempHtmlPath);
    
    try {
      fs.writeFileSync(tempHtmlPath, staticHtml);
      console.log('Temp HTML file created successfully');
      
      // Load the temp HTML file
      win.loadFile(tempHtmlPath)
        .then(() => {
          console.log('Temp HTML file loaded successfully');
          
          // If we successfully loaded the test file, try loading index.html after a delay
          setTimeout(() => {
            // Try to find and load the actual game file
            console.log('Now attempting to load the game file...');
            
            // Search for index.html in various locations
            const possibleLocations = [
              path.join(app.getAppPath(), 'build', 'index.html'),
              path.join(process.resourcesPath, 'app', 'build', 'index.html'),
              path.join(process.resourcesPath, 'build', 'index.html')
            ];
            
            let gameFileFound = false;
            
            for (const location of possibleLocations) {
              try {
                if (fs.existsSync(location)) {
                  console.log('Found game file at:', location);
                  console.log('Loading game file...');
                  
                  win.loadFile(location)
                    .then(() => {
                      console.log('Game file loaded successfully');
                    })
                    .catch(err => {
                      console.error('Error loading game file:', err);
                    });
                  
                  gameFileFound = true;
                  break;
                }
              } catch (err) {
                console.error('Error checking location:', location, err);
              }
            }
            
            if (!gameFileFound) {
              console.error('Could not find game file in any location');
            }
          }, 3000); // Wait 3 seconds before trying to load the game
        })
        .catch(err => {
          console.error('Error loading temp HTML file:', err);
        });
    } catch (err) {
      console.error('Error creating temp HTML file:', err);
      
      // If we can't even create and load a temp file, just show a simple message
      win.loadURL('data:text/html,' + encodeURIComponent(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { background-color: #222; color: white; font-family: Arial; text-align: center; padding: 50px; }
              h1 { color: red; }
            </style>
          </head>
          <body>
            <h1>Electron Error</h1>
            <p>Could not create temporary HTML file.</p>
            <p>Error: ${err.message}</p>
          </body>
        </html>
      `));
    }
  }
  
  // Always open DevTools in production to help diagnose issues
  if (!isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Log important directories
  console.log('App path:', app.getAppPath());
  console.log('User data path:', app.getPath('userData'));
  console.log('Exe path:', app.getPath('exe'));
  
  // Create file for logs in user data directory
  let logFile;
  try {
    const userDataPath = app.getPath('userData');
    // Ensure the directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      console.log('Created user data directory:', userDataPath);
    }
    
    logFile = path.join(userDataPath, 'smashed-log.txt');
    fs.writeFileSync(logFile, `Smashed launched at ${new Date().toISOString()}\n`, { flag: 'a' });
    fs.appendFileSync(logFile, `App path: ${app.getAppPath()}\n`);
    fs.appendFileSync(logFile, `Running in ${isDev ? 'development' : 'production'} mode\n`);
    fs.appendFileSync(logFile, `Platform: ${process.platform}\n`);
    
    // Try to get additional environment info
    try {
      const electronVersion = process.versions.electron;
      const nodeVersion = process.versions.node;
      const v8Version = process.versions.v8;
      fs.appendFileSync(logFile, `Electron: ${electronVersion}, Node: ${nodeVersion}, V8: ${v8Version}\n`);
    } catch (envErr) {
      fs.appendFileSync(logFile, `Error getting versions: ${envErr}\n`);
    }
    
    // Redirect console.log to file
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = function() {
      try {
        const args = Array.from(arguments).join(' ');
        fs.appendFileSync(logFile, `[LOG] ${args}\n`);
      } catch (logErr) {
        // Don't crash if logging fails
      }
      originalConsoleLog.apply(console, arguments);
    };
    
    console.error = function() {
      try {
        const args = Array.from(arguments).join(' ');
        fs.appendFileSync(logFile, `[ERROR] ${args}\n`);
      } catch (logErr) {
        // Don't crash if logging fails
      }
      originalConsoleError.apply(console, arguments);
    };
    
    console.log('Logging initialized');
  } catch (err) {
    console.error('Failed to set up logging:', err);
  }
  
  createWindow();
});

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