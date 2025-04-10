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
    
    // On load failure, try to show an error screen
    win.webContents.executeJavaScript(`
      document.body.innerHTML = '<div style="color: white; font-family: Arial; padding: 50px; background: #333; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;"><h2>Failed to load game content</h2><p>Error: ${errorDescription} (${errorCode})</p><p>Please check the console for more details.</p></div>';
    `).catch(e => console.error('Failed to show error page:', e));
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
      let indexPath;
      
      // Windows & Mac have different path behaviors in packaged apps
      const fs = require('fs');
      console.log('Current directory:', __dirname);
      console.log('Resource path:', process.resourcesPath);
      
      // List all directories/files in current directory
      try {
        console.log('Files in current directory:');
        const files = fs.readdirSync(__dirname);
        files.forEach(file => console.log(' - ' + file));
      } catch (err) {
        console.error('Error listing directory:', err);
      }
      
      if (process.platform === 'win32') {
        // Windows path - might need resources/app/build/
        const possiblePaths = [
          path.join(__dirname, 'index.html'),
          path.join(process.resourcesPath, 'app', 'build', 'index.html'),
          path.join(__dirname, '..', 'index.html'),
          path.join(__dirname, '..', '..', 'index.html'),
          path.join(__dirname, '..', '..', '..', 'index.html'),
          path.join(process.resourcesPath, 'app.asar', 'build', 'index.html'),
          path.join(process.resourcesPath, 'app.asar.unpacked', 'build', 'index.html'),
          path.join(app.getAppPath(), 'build', 'index.html'),
          path.join(app.getAppPath(), 'index.html')
        ];
        
        // Try all possible paths
        let pathFound = false;
        for (const possiblePath of possiblePaths) {
          console.log('Checking if file exists:', possiblePath);
          try {
            if (fs.existsSync(possiblePath)) {
              indexPath = possiblePath;
              console.log('Found index.html at:', indexPath);
              pathFound = true;
              break;
            }
          } catch (fsErr) {
            console.error('Error checking path:', fsErr);
          }
        }
        
        if (!pathFound) {
          console.log('No index.html found in regular paths, trying to search for it');
          
          // Desperate measures: try to recursively find index.html
          const findIndexHtml = (dirPath, depth = 0) => {
            if (depth > 5) return null; // Stop at depth 5 to prevent infinite recursion
            
            try {
              console.log(`Searching in: ${dirPath} (depth: ${depth})`);
              const files = fs.readdirSync(dirPath);
              
              // Check if index.html exists in this directory
              if (files.includes('index.html')) {
                return path.join(dirPath, 'index.html');
              }
              
              // Recursively check subdirectories
              for (const file of files) {
                const filePath = path.join(dirPath, file);
                try {
                  if (fs.statSync(filePath).isDirectory()) {
                    const result = findIndexHtml(filePath, depth + 1);
                    if (result) return result;
                  }
                } catch (err) {
                  console.error(`Error checking file ${filePath}:`, err);
                }
              }
            } catch (err) {
              console.error(`Error searching directory ${dirPath}:`, err);
            }
            return null;
          };
          
          const foundPath = findIndexHtml(process.resourcesPath);
          if (foundPath) {
            indexPath = foundPath;
            console.log('Found index.html by searching:', indexPath);
          } else {
            // Last resort - use default path
            indexPath = path.join(__dirname, 'index.html');
            console.log('Using default path as fallback:', indexPath);
          }
        }
      } else {
        // Mac path - standard
        indexPath = path.join(__dirname, 'index.html');
      }
      
      console.log('Production mode: loading from', indexPath);
      
      // Try to verify the file contents before loading
      try {
        const fileContents = fs.readFileSync(indexPath, 'utf8');
        const isValidHtml = fileContents.includes('<!DOCTYPE html>') || 
                            fileContents.includes('<html') ||
                            fileContents.includes('<HTML');
        
        console.log(`Index.html file validation: ${isValidHtml ? 'Valid HTML found' : 'No HTML detected!'}`);
        
        if (!isValidHtml) {
          console.log('First 200 chars of file:', fileContents.substring(0, 200));
        }
      } catch (error) {
        console.error('Error reading index.html:', error);
      }
      
      // Load the file and handle errors
      win.loadFile(indexPath)
        .then(() => {
          console.log('File loaded successfully');
          // Check if body is empty after a delay
          setTimeout(() => {
            win.webContents.executeJavaScript(`
              if (!document.body.innerHTML.trim()) {
                document.body.innerHTML = '<div style="color: white; font-family: Arial; padding: 50px; background: #333; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;"><h2>Empty page detected</h2><p>The game content could not be loaded correctly.</p></div>';
              }
            `).catch(e => console.error('Error checking body content:', e));
          }, 2000);
        })
        .catch(e => {
          console.error('loadFile error:', e);
          
          // Create a simple HTML page if loading fails
          win.webContents.loadURL(`data:text/html,
            <html>
              <head>
                <title>Smashed - Error</title>
                <style>
                  body { background: #000; color: white; font-family: Arial; padding: 20px; }
                  .container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
                  h1 { color: #ff4444; }
                  button { background: #444; color: white; border: none; padding: 10px 20px; margin-top: 20px; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Failed to load game</h1>
                  <p>Unable to find or load the game files.</p>
                  <p>Error: ${e.message || 'Unknown error'}</p>
                  <button onclick="window.location.reload()">Retry</button>
                </div>
              </body>
            </html>
          `).catch(innerError => console.error('Failed to show error page:', innerError));
        });
      
      // Open dev tools to debug loading issues in production
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

app.whenReady().then(() => {
  // Log important directories
  console.log('App path:', app.getAppPath());
  console.log('User data path:', app.getPath('userData'));
  console.log('Exe path:', app.getPath('exe'));
  
  // Create file for logs in user data directory
  const logFile = path.join(app.getPath('userData'), 'smashed-log.txt');
  try {
    fs.writeFileSync(logFile, `Smashed launched at ${new Date().toISOString()}\n`, { flag: 'a' });
    fs.appendFileSync(logFile, `App path: ${app.getAppPath()}\n`);
    fs.appendFileSync(logFile, `Running in ${isDev ? 'development' : 'production'} mode\n`);
    
    // Redirect console.log to file
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = function() {
      const args = Array.from(arguments).join(' ');
      fs.appendFileSync(logFile, `[LOG] ${args}\n`);
      originalConsoleLog.apply(console, arguments);
    };
    
    console.error = function() {
      const args = Array.from(arguments).join(' ');
      fs.appendFileSync(logFile, `[ERROR] ${args}\n`);
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
