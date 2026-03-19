import { ipcMain, app } from "electron";
import { autoUpdater } from "electron-updater";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import https from "node:https";
import type { UpdateInfo, UpdateCheckResult, UpdateProgressEvent, UpdateErrorEvent, UpdatePreferences } from "../../types";

const execAsync = promisify(exec);

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
            releaseNotes:
              typeof result.updateInfo.releaseNotes === "string"
                ? result.updateInfo.releaseNotes
                : result.updateInfo.releaseNotes?.[0]?.note || undefined,
            releaseName: result.updateInfo.releaseName || undefined,
            releaseDate: result.updateInfo.releaseDate || undefined,
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
        releaseNotes:
          typeof _info.releaseNotes === "string"
            ? _info.releaseNotes
            : _info.releaseNotes?.[0]?.note || undefined,
        releaseName: _info.releaseName || undefined,
        releaseDate: _info.releaseDate || undefined,
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
  autoUpdater.on("error", (error: any) => {
    const mainWindow = require("../index").getMainWindow?.();
    if (mainWindow) {
      const errorEvent: UpdateErrorEvent = {
        error: error?.message || String(error),
        code: error?.code,
      };
      mainWindow.webContents.send("update:error", errorEvent);
    }
  });
}

// ─── EPIC 4: CONTAINER VERSION CONTROL ───────────────────────

/**
 * Consulta Docker Hub para obtener los últimos tags de openclaw/agent
 */
function fetchDockerTags(repo: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const url = `https://hub.docker.com/v2/repositories/${repo}/tags/?page_size=20`;
    https.get(url, { headers: { "User-Agent": "OpenClaw-Installer/1.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            const tags = parsed.results
              .map((r: any) => r.name)
              .filter((tag: string) => tag !== "latest" && !tag.includes("dev")) // Filtrar tags inestables
              // Sort tags roughly by date/version descending (Docker API usually returns newest first though)
            resolve(tags);
          } else {
            resolve([]); // Fallback to empty if Hub is down or rate limited
          }
        } catch {
          resolve([]);
        }
      });
    }).on("error", () => resolve([]));
  });
}

function getComposePath(): string {
  return path.join(os.homedir(), ".openclaw", "docker-compose.yml");
}

export function registerVersionControlHandlers(): void {
  /**
   * update:get-available-versions - Consulta tags de Docker Hub
   */
  ipcMain.handle("update:get-available-versions", async () => {
    try {
      const tags = await fetchDockerTags("openclaw/agent");
      if (!tags.includes("latest")) tags.unshift("latest"); // Siempre ofrecer latest
      return { success: true, tags };
    } catch {
      return { success: false, tags: ["latest"] };
    }
  });

  /**
   * update:get-current-version - Lee el docker-compose.yml para ver qué tag está configurado
   */
  ipcMain.handle("update:get-current-version", async () => {
    try {
      const composePath = getComposePath();
      if (!(await fs.exists(composePath))) return { success: false, version: null };
      
      const content = await fs.readFile(composePath, "utf-8");
      // Buscar la linea de la imagen de openclaw
      const match = content.match(/image:\s*openclaw\/agent:(.+)/);
      return { success: true, version: match ? match[1].trim() : "latest" };
    } catch {
      return { success: false, version: null };
    }
  });

  /**
   * update:apply-version - Modifica el docker-compose.yml y levanta el nuevo contenedor
   */
  ipcMain.handle("update:apply-version", async (_, newTag: string) => {
    try {
      const composePath = getComposePath();
      if (!(await fs.exists(composePath))) throw new Error("docker-compose.yml no encontrado");

      let content = await fs.readFile(composePath, "utf-8");
      
      // Reemplaza el tag actual
      content = content.replace(/image:\s*openclaw\/agent:[^\s]+/, `image: openclaw/agent:${newTag}`);
      await fs.writeFile(composePath, content, "utf-8");

      // Pull new image -> Stop -> Rm -> Up
      const targetImage = `openclaw/agent:${newTag}`;
      const workingDir = path.dirname(composePath);

      // 1. Pull new image
      const pullCmd = `docker pull ${targetImage}`;
      console.log("Pulling openclaw:", pullCmd);
      await execAsync(pullCmd, { cwd: workingDir, timeout: 120000 });

      // 2. Stop and remove existing containers (if any)
      const downCmd = `docker compose down`;
      console.log("Stopping existing containers:", downCmd);
      await execAsync(downCmd, { cwd: workingDir, timeout: 60000 });

      // 3. Levantar con el nuevo docker-compose.yml
      const upCmd = `docker compose up -d`;
      console.log("Starting container with new version:", upCmd);
      await execAsync(upCmd, { cwd: workingDir, timeout: 60000 });

      return { success: true, message: `Actualizado a ${newTag}` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : String(err) };
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
