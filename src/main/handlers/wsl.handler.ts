import { ipcMain } from "electron";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export function registerWslHandlers(): void {
  ipcMain.handle("wsl:install", async (_, distro: string) => {
    try {
      // In Windows, wsl --install requires elevation.
      // We use PowerShell's Start-Process with -Verb RunAs to trigger a native UAC prompt.
      // -Wait ensures we don't return until the installation is completed or closed.
      const cmd = `powershell -Command "Start-Process wsl -ArgumentList '--install --distribution ${distro}' -Verb RunAs -Wait"`;
      console.log(`Executing WSL install: ${cmd}`);
      await execAsync(cmd);
      return { success: true };
    } catch (error) {
      console.error("Error installing WSL:", error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("system:reboot", async () => {
    try {
      const cmd = `powershell -Command "Restart-Computer -Force"`;
      await execAsync(cmd);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
