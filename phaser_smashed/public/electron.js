const { app, BrowserWindow, dialog, protocol } = require('electron');
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
    
    // On load failure, load a basic HTML directly
    const htmlContent = `
      <html>
        <head>
          <title>Smashed - Error Loading</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #000000;
              color: #ffffff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            h1 { color: #ff6666; margin-bottom: 10px; }
            .error-code { font-family: monospace; background: #333; padding: 5px 10px; border-radius: 4px; }
            .actions { margin-top: 30px; }
            button {
              background: #444;
              color: white;
              border: none;
              padding: 10px 20px;
              margin: 10px;
              cursor: pointer;
              border-radius: 4px;
            }
            button:hover { background: #555; }
            .log-path { font-size: 12px; color: #aaa; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Failed to Load Game Content</h1>
          <p>The game couldn't be loaded properly.</p>
          <p>Error: <span class="error-code">${errorDescription} (${errorCode})</span></p>
          
          <div class="actions">
            <button onclick="window.location.reload()">Retry Loading</button>
          </div>
          
          <p class="log-path">
            You can find error logs at:<br>
            <span class="error-code">%AppData%\\Smashed\\smashed-log.txt</span>
          </p>
        </body>
      </html>
    `;
    
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
      .catch(err => console.error('Failed to load error page:', err));
  });
  
  // Listen for page loaded event
  win.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });
  
  // Listen for console messages from the renderer
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message}`);
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
      // STEP 1: Create and load a test page first to verify rendering
      const testHtmlPath = path.join(app.getPath('userData'), 'test.html');
      try {
        const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Smashed Test Page</title>
          <style>
            body { background: #000; color: white; font-family: Arial; padding: 20px; text-align: center; }
            h1 { color: #ff0; }
            button { background: #444; color: white; border: none; padding: 10px 20px; margin: 10px; cursor: pointer; }
            pre { background: #333; padding: 10px; text-align: left; max-height: 200px; overflow: auto; margin: 10px; }
          </style>
        </head>
        <body>
          <h1>Smashed Test Page</h1>
          <p>If you can see this page, rendering is working correctly.</p>
          <div>
            <button id="loadGameBtn">Load Game</button>
            <button id="showPathsBtn">Show Possible Paths</button>
            <button id="showDirsBtn">Show Directory Contents</button>
          </div>
          <div id="infoArea"></div>
          
          <script>
            // Get app paths from window
            const appPath = '${app.getAppPath().replace(/\\/g, '\\\\')}';
            const resourcesPath = '${process.resourcesPath.replace(/\\/g, '\\\\')}';
            const userData = '${app.getPath('userData').replace(/\\/g, '\\\\')}';
            
            // Generate all possible index.html paths for Windows
            const paths = [
              appPath + '/build/index.html',
              appPath + '/index.html',
              resourcesPath + '/app/build/index.html',
              resourcesPath + '/app.asar/build/index.html',
              resourcesPath + '/build/index.html'
            ];
            
            document.getElementById('loadGameBtn').addEventListener('click', () => {
              // Try to go to the app location
              try {
                window.location = 'file://' + appPath + '/build/index.html';
              } catch(e) {
                document.getElementById('infoArea').innerHTML = '<pre>Error: ' + e.toString() + '</pre>';
              }
            });
            
            document.getElementById('showPathsBtn').addEventListener('click', () => {
              const infoArea = document.getElementById('infoArea');
              infoArea.innerHTML = '<h3>Possible Paths:</h3><pre>' + 
                paths.join('\\n') + '</pre>';
            });
            
            document.getElementById('showDirsBtn').addEventListener('click', () => {
              fetch('file-list://' + appPath)
                .then(response => response.text())
                .then(data => {
                  document.getElementById('infoArea').innerHTML = '<h3>Directory Contents:</h3><pre>' + data + '</pre>';
                })
                .catch(err => {
                  document.getElementById('infoArea').innerHTML = '<pre>Error: ' + err.toString() + '</pre>';
                });
            });
          </script>
        </body>
        </html>`;
        
        fs.writeFileSync(testHtmlPath, testHtml);
        console.log('Created test HTML at:', testHtmlPath);
        
        // Register custom protocol to read directory contents
        if (protocol) {
          protocol.registerFileProtocol('file-list', (request, callback) => {
            try {
              const url = request.url.substr(12); // Remove 'file-list://'
              const dirContents = fs.readdirSync(url).join('\n');
              callback({ data: dirContents, mimeType: 'text/plain' });
            } catch (error) {
              callback({ data: 'Error: ' + error.toString(), mimeType: 'text/plain' });
            }
          });
        }
        
        // Try to load this page first instead of the game
        win.loadFile(testHtmlPath)
          .then(() => {
            console.log('Test page loaded successfully');
          })
          .catch(err => {
            console.error('Failed to load test page:', err);
          });
      } catch (testErr) {
        console.error('Error creating test page:', testErr);
        // Show error directly
        win.loadURL('data:text/html,<html><body style="background:#000;color:white;font-family:sans-serif;padding:20px;text-align:center;"><h1>Smashed Error</h1><p>Failed to create test page: ' + testErr.message + '</p></body></html>');
      }
    } catch (outerError) {
      console.error('Outer error in electron.js:', outerError);
      win.loadURL('data:text/html,<html><body style="background:#000;color:white;font-family:sans-serif;padding:20px;"><h1>Error</h1><p>' + outerError.message + '</p></body></html>');
    }
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