import { ipcMain, app } from "electron";
import path from "node:path";
import fs from "node:fs";
import type { InstallConfig } from "../../types";
import { saveSecret, getSecret, deleteSecret } from "../keychain";

const CONFIG_PATH = path.join(app.getPath("userData"), "installer-config.json");

export function registerConfigHandlers(): void {
  ipcMain.handle("config:save", async (_, config: Partial<InstallConfig>) => {
    try {
      const existing = readConfig();
      // Handle secret apiKey explicitly
      const { apiKey, ...plainConfig } = config;
      if (apiKey) {
        saveSecret("LLM_API_KEY", apiKey);
      }

      const merged = { ...existing, ...plainConfig };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf8");
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("config:load", async () => {
    try {
      const config = readConfig();
      const apiKey = getSecret("LLM_API_KEY");
      if (apiKey) {
        config.apiKey = apiKey;
      }
      return config;
    } catch {
      return null;
    }
  });

  ipcMain.handle("config:clear", async () => {
    try {
      if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
      deleteSecret("LLM_API_KEY");
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
