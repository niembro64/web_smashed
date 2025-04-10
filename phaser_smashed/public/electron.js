const { app, BrowserWindow, dialog } = require('electron');
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
      // Add a menu for direct loading and diagnostics
      const { Menu } = require('electron');
      
      const template = [
        {
          label: 'File',
          submenu: [
            {
              label: 'Load Game',
              click: async () => {
                try {
                  // Try various paths for index.html
                  const possiblePaths = [
                    path.join(app.getAppPath(), 'build', 'index.html'),
                    path.join(process.resourcesPath, 'app', 'build', 'index.html'),
                    path.join(process.resourcesPath, 'build', 'index.html'),
                    path.join(app.getAppPath(), 'build', 'app.html'),
                    path.join(process.resourcesPath, 'app', 'build', 'app.html'),
                    path.join(process.resourcesPath, 'build', 'app.html')
                  ];
                  
                  // Try each path
                  let loaded = false;
                  for (const p of possiblePaths) {
                    console.log('Checking path:', p);
                    if (fs.existsSync(p)) {
                      console.log('Found file at:', p);
                      try {
                        await win.loadFile(p);
                        console.log('Successfully loaded:', p);
                        loaded = true;
                        break;
                      } catch (loadErr) {
                        console.error('Failed to load:', p, loadErr);
                      }
                    }
                  }
                  
                  if (!loaded) {
                    console.error('Could not find index.html in any expected location');
                    win.webContents.loadURL('data:text/html,<html><body style="background: black; color: white; font-family: sans-serif; padding: 2em; text-align: center;"><h1>Could not find game file</h1><p>The game files could not be found in any expected location.</p></body></html>');
                  }
                } catch (err) {
                  console.error('Error in load game menu:', err);
                }
              }
            },
            {
              label: 'Toggle DevTools',
              click: () => win.webContents.toggleDevTools()
            },
            { type: 'separator' },
            {
              label: 'Exit',
              click: () => app.quit()
            }
          ]
        }
      ];
      
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
      
      // Try to load directly from one of the most likely locations
      console.log('Attempting to load the game directly...');
      
      // Try to find index.html in likely locations
      const indexPaths = [
        path.join(app.getAppPath(), 'build', 'index.html'),
        path.join(process.resourcesPath, 'app', 'build', 'index.html'),
        path.join(process.resourcesPath, 'build', 'index.html')
      ];
      
      let loaded = false;
      
      for (const indexPath of indexPaths) {
        try {
          if (fs.existsSync(indexPath)) {
            console.log('Found index.html at:', indexPath);
            const content = fs.readFileSync(indexPath, 'utf8').substring(0, 200);
            console.log('File content starts with:', content);
            
            if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
              console.log('Loading file:', indexPath);
              win.loadFile(indexPath);
              loaded = true;
              break;
            } else {
              console.log('File exists but does not appear to be HTML');
            }
          }
        } catch (err) {
          console.error('Error checking path:', indexPath, err);
        }
      }
      
      // If we couldn't load the game directly, show a simple HTML page with buttons
      if (!loaded) {
        console.log('Could not auto-load game file, showing diagnostic page');
        const helpHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Smashed - Diagnostics</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                text-align: center;
              }
              h1 { color: #ff0; margin-bottom: 20px; }
              .button-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 20px 0;
                gap: 10px;
              }
              button {
                background: #444;
                color: white;
                border: none;
                padding: 10px 20px;
                width: 80%;
                max-width: 600px;
                cursor: pointer;
                text-align: left;
                border-radius: 4px;
              }
              button:hover { background: #555; }
              .path-info {
                background: #222;
                padding: 10px;
                margin: 10px 0;
                text-align: left;
                border-radius: 4px;
                overflow-wrap: break-word;
                max-width: 80%;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <h1>Smashed Game Launcher</h1>
            <p>Select from one of the following options to launch the game:</p>
            
            <div class="button-container" id="buttons"></div>
            
            <div class="path-info">
              <p>App Path: <span id="app-path"></span></p>
              <p>Resources Path: <span id="res-path"></span></p>
            </div>
            
            <script>
              // Path information
              document.getElementById('app-path').textContent = '${app.getAppPath().replace(/\\/g, '\\\\')}';
              document.getElementById('res-path').textContent = '${process.resourcesPath.replace(/\\/g, '\\\\')}';
              
              // Create buttons for each path
              const buttonContainer = document.getElementById('buttons');
              const paths = [
                ['App Path / build / index.html', '${path.join(app.getAppPath(), 'build', 'index.html').replace(/\\/g, '\\\\')}'],
                ['Resources / app / build / index.html', '${path.join(process.resourcesPath, 'app', 'build', 'index.html').replace(/\\/g, '\\\\')}'],
                ['Resources / build / index.html', '${path.join(process.resourcesPath, 'build', 'index.html').replace(/\\/g, '\\\\')}'],
                ['App Path / build / app.html', '${path.join(app.getAppPath(), 'build', 'app.html').replace(/\\/g, '\\\\')}'],
                ['Resources / app / build / app.html', '${path.join(process.resourcesPath, 'app', 'build', 'app.html').replace(/\\/g, '\\\\')}'],
                ['Resources / build / app.html', '${path.join(process.resourcesPath, 'build', 'app.html').replace(/\\/g, '\\\\')}']
              ];
              
              paths.forEach(([label, path]) => {
                const button = document.createElement('button');
                button.textContent = label;
                button.onclick = function() {
                  window.location = 'file://' + path;
                };
                buttonContainer.appendChild(button);
              });
            </script>
          </body>
          </html>
        `;
        
        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(helpHtml)}`);
      }
      
    } catch (error) {
      console.error('Error in production mode:', error);
      win.loadURL(`data:text/html;charset=utf-8,<html><body style="background:black;color:white;font-family:sans-serif;padding:2em;text-align:center;"><h1>Error</h1><p>${error.message}</p></body></html>`);
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