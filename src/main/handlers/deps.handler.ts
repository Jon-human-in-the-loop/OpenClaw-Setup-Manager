import { ipcMain } from "electron";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { logAction } from "../db";

const execAsync = promisify(exec);

const WINGET_PACKAGES: Record<string, string> = {
  node: "OpenJS.NodeJS",
  git: "Git.Git",
  ollama: "Ollama.Ollama",
  docker: "Docker.DockerDesktop",
};

export function registerDepsHandlers(): void {
  ipcMain.handle("deps:install", async (_, depId: string) => {
    logAction("deps:install", `depId=${depId}`, "started");
    try {
      if (process.platform === "win32") {
        const pkgId = WINGET_PACKAGES[depId];
        if (!pkgId) {
          const msg = `Paquete winget no definido para la dependencia: ${depId}`;
          logAction("deps:install", `depId=${depId}`, `error: ${msg}`);
          throw new Error(msg);
        }
        
        const wingetArgs = `install --id ${pkgId} -e --accept-package-agreements --accept-source-agreements`;
        const cmd = `powershell -Command "Start-Process winget -ArgumentList '${wingetArgs}' -Verb RunAs -Wait"`;
        
        console.log(`Instalando dependencia ${depId} vía winget: ${cmd}`);
        await execAsync(cmd);
        logAction("deps:install", `depId=${depId}, pkgId=${pkgId}`, "success");
        return { success: true };
      }
      
      logAction("deps:install", `depId=${depId}`, "skipped: not windows");
      return { success: false, error: "La instalación automatizada de esta dependencia solo está soportada en Windows actualmente." };
    } catch (error) {
      logAction("deps:install", `depId=${depId}`, `error: ${String(error)}`);
      console.error(`Error installing dependency ${depId}:`, error);
      return { success: false, error: String(error) };
    }
  });
}
