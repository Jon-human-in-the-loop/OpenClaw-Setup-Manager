import { ipcMain } from "electron";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { logAction } from "../db";
import { getWslDetailedStatus, clearWslCache } from "../wsl-utils";
import type { WslDetailedStatus } from "../../types";

const execAsync = promisify(exec);

export function registerWslHandlers(): void {
  /**
   * wsl:status — Returns the current WSL state without side effects.
   */
  ipcMain.handle("wsl:status", async (_, forceRefresh = false): Promise<WslDetailedStatus> => {
    if (forceRefresh) clearWslCache();
    const status = getWslDetailedStatus(/* useCache */ !forceRefresh);
    logAction("wsl:status", "query", status.status);
    return status;
  });

  /**
   * wsl:install-wsl — Enables the WSL Windows feature and installs Ubuntu.
   * This triggers a Windows elevation prompt and usually requires a reboot.
   */
  ipcMain.handle("wsl:install-wsl", async (): Promise<{ success: boolean; error?: string }> => {
    logAction("wsl:install-wsl", "triggered", "started");
    try {
      // `wsl --install` enables the WSL optional feature and installs Ubuntu by default.
      // Run elevated so the user gets the UAC prompt.
      const cmd =
        `powershell -Command "Start-Process wsl -ArgumentList '--install' -Verb RunAs -Wait"`;
      await execAsync(cmd, { timeout: 120_000 });
      clearWslCache();
      logAction("wsl:install-wsl", "triggered", "success");
      return { success: true };
    } catch (error) {
      logAction("wsl:install-wsl", "triggered", `error: ${String(error)}`);
      return { success: false, error: String(error) };
    }
  });

  /**
   * wsl:install — Installs a specific Linux distribution inside an already-
   * enabled WSL environment.
   */
  ipcMain.handle("wsl:install", async (_, distro: string) => {
    if (!/^[a-zA-Z0-9\-]+$/.test(distro)) {
      logAction("wsl:install", `distro=${distro}`, "rejected: invalid distro name");
      return {
        success: false,
        error: "Invalid distribution name: only alphanumeric characters and hyphens are allowed.",
      };
    }
    logAction("wsl:install", `distro=${distro}`, "started");
    try {
      const cmd = `powershell -Command "Start-Process wsl -ArgumentList '--install --distribution ${distro}' -Verb RunAs -Wait"`;
      await execAsync(cmd, { timeout: 300_000 });
      clearWslCache();
      logAction("wsl:install", `distro=${distro}`, "success");
      return { success: true };
    } catch (error) {
      logAction("wsl:install", `distro=${distro}`, `error: ${String(error)}`);
      return { success: false, error: String(error) };
    }
  });

  /**
   * system:reboot — Requests a Windows reboot (elevated).
   */
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
