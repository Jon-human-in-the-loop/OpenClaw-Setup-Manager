import { ipcMain } from "electron";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { logAction } from "../db";

const execAsync = promisify(exec);

export function registerWslHandlers(): void {
  ipcMain.handle("wsl:install", async (_, distro: string) => {
    logAction("wsl:install", `distro=${distro}`, "started");
    try {
      const cmd = `powershell -Command "Start-Process wsl -ArgumentList '--install --distribution ${distro}' -Verb RunAs -Wait"`;
      console.log(`Executing WSL install: ${cmd}`);
      await execAsync(cmd);
      logAction("wsl:install", `distro=${distro}`, "success");
      return { success: true };
    } catch (error) {
      logAction("wsl:install", `distro=${distro}`, `error: ${String(error)}`);
      console.error("Error installing WSL:", error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("system:reboot", async () => {
    logAction("system:reboot", "user-triggered", "started");
    try {
      const cmd = `powershell -Command "Restart-Computer -Force"`;
      await execAsync(cmd);
      return { success: true };
    } catch (error) {
      logAction("system:reboot", "user-triggered", `error: ${String(error)}`);
      return { success: false, error: String(error) };
    }
  });
}
