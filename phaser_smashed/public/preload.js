// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    saveScreenshot: (dataUrl) => {
      ipcRenderer.send('save-screenshot', dataUrl);
    },
    onScreenshotSaved: (callback) => {
      ipcRenderer.on('screenshot-saved', (event, result) => callback(result));
    },
    unlockAchievement: (achievementName) => {
      ipcRenderer.send('unlock-achievement', achievementName);
    },
    onAchievementUnlocked: (callback) => {
      ipcRenderer.on('achievement-unlocked', (event, result) => callback(result));
    }
  }
);

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});