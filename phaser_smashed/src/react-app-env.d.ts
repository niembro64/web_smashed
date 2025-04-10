/// <reference types="react-scripts" />

// Define Electron API interface for TypeScript
interface ElectronAPI {
  saveScreenshot: (dataUrl: string) => void;
  onScreenshotSaved: (callback: (result: { success: boolean, path?: string, error?: string }) => void) => void;
  unlockAchievement: (achievementName: string) => void;
  onAchievementUnlocked: (callback: (result: { success: boolean, name?: string, error?: string }) => void) => void;
}

// Augment the Window interface
declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
