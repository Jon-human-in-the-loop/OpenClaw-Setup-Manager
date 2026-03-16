import { autoUpdater } from "electron-updater";
import { ipcMain, app } from "electron";
import { UpdateCheckResult, UpdateProgressEvent, UpdateErrorEvent, UpdatePreferences } from "../types/index.js";

// Configure auto-updater
export function configureAutoUpdater() {
  // Only use GitHub releases for updates
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;

  // Check for updates on startup (after a delay)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("Auto-update check failed:", err);
    });
  }, 5000);

  // Check for updates every 24 hours
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("Auto-update check failed:", err);
    });
  }, 24 * 60 * 60 * 1000);
}

// Register IPC handlers for update operations
export function registerUpdateHandlers() {
  // Check for updates manually
  ipcMain.handle("update:check", async (): Promise<UpdateCheckResult> => {
    try {
      const result = await autoUpdater.checkForUpdates();
      if (result?.updateInfo) {
        return {
          updateAvailable: true,
          updateInfo: {
            version: result.updateInfo.version,
            releaseNotes: typeof result.updateInfo.releaseNotes === "string"
              ? result.updateInfo.releaseNotes
              : result.updateInfo.releaseNotes?.[0]?.note,
            releaseName: result.updateInfo.releaseName,
            releaseDate: result.updateInfo.releaseDate,
          },
        };
      }
      return { updateAvailable: false };
    } catch (error) {
      console.error("Update check error:", error);
      return { updateAvailable: false };
    }
  });

  // Download update manually
  ipcMain.handle("update:download", async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  });

  // Install update and restart
  ipcMain.handle("update:install", async () => {
    try {
      autoUpdater.quitAndInstall(false, true);
      return { success: true };
    } catch (error) {
      console.error("Install error:", error);
      throw error;
    }
  });

  // Get current app version
  ipcMain.handle("app:version", async () => {
    return {
      version: app.getVersion(),
    };
  });

  // Update available event listener
  autoUpdater.on("update-available", (_info) => {
    const mainWindow = require("../index").getMainWindow?.();
    if (mainWindow) {
      mainWindow.webContents.send("update:available", {
        version: _info.version,
        releaseNotes: typeof _info.releaseNotes === "string"
          ? _info.releaseNotes
          : _info.releaseNotes?.[0]?.note,
        releaseName: _info.releaseName,
        releaseDate: _info.releaseDate,
      });
    }
  });

  // Update downloaded event listener
  autoUpdater.on("update-downloaded", () => {
    const mainWindow = require("../index").getMainWindow?.();
    if (mainWindow) {
      mainWindow.webContents.send("update:downloaded");
    }
  });

  // Download progress event
  autoUpdater.on("download-progress", (progress) => {
    const mainWindow = require("../index").getMainWindow?.();
    if (mainWindow) {
      const progressEvent: UpdateProgressEvent = {
        percent: Math.round(progress.percent),
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred,
      };
      mainWindow.webContents.send("update:progress", progressEvent);
    }
  });

  // Error event listener
  autoUpdater.on("error", (error) => {
    const mainWindow = require("../index").getMainWindow?.();
    if (mainWindow) {
      const errorEvent: UpdateErrorEvent = {
        error: error.message,
        code: error.code,
      };
      mainWindow.webContents.send("update:error", errorEvent);
    }
  });
}

// Get update preferences from config
export function getUpdatePreferences(): UpdatePreferences {
  const path = require("node:path");
  const fs = require("node:fs");
  const prefsPath = path.join(app.getPath("userData"), "update-prefs.json");

  try {
    if (fs.existsSync(prefsPath)) {
      const data = JSON.parse(fs.readFileSync(prefsPath, "utf8"));
      return { autoCheckForUpdates: true, updateChannel: "latest", ...data };
    }
  } catch {
    // Return defaults if file doesn't exist or is corrupted
  }

  return { autoCheckForUpdates: true, updateChannel: "latest" };
}

// Save update preferences
export function saveUpdatePreferences(prefs: Partial<UpdatePreferences>) {
  const path = require("node:path");
  const fs = require("node:fs");
  const prefsPath = path.join(app.getPath("userData"), "update-prefs.json");

  try {
    const current = getUpdatePreferences();
    fs.writeFileSync(prefsPath, JSON.stringify({ ...current, ...prefs }, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save update preferences:", error);
  }
}
