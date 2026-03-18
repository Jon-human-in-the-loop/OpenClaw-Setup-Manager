import { ipcMain, app } from "electron";
import path from "node:path";
import fs from "node:fs";
import type { InstallConfig } from "../../types";

const CONFIG_PATH = path.join(app.getPath("userData"), "installer-config.json");

export function registerConfigHandlers(): void {
  ipcMain.handle("config:save", async (_, config: Partial<InstallConfig>) => {
    try {
      const existing = readConfig();
      const merged = { ...existing, ...config };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf8");
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("config:load", async () => {
    try {
      return readConfig();
    } catch {
      return null;
    }
  });

  ipcMain.handle("config:clear", async () => {
    try {
      if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}

function readConfig(): Partial<InstallConfig> {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}
