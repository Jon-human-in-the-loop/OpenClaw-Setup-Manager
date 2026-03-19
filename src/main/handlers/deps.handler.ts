import { ipcMain } from "electron";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const WINGET_PACKAGES: Record<string, string> = {
  node: "OpenJS.NodeJS",
  git: "Git.Git",
  ollama: "Ollama.Ollama",
  docker: "Docker.DockerDesktop",
};

export function registerDepsHandlers(): void {
  ipcMain.handle("deps:install", async (_, depId: string) => {
    try {
      if (process.platform === "win32") {
        const pkgId = WINGET_PACKAGES[depId];
        if (!pkgId) {
          throw new Error(`Paquete winget no definido para la dependencia: ${depId}`);
        }
        
        // Winget requiere elevación para algunas apps y acepta acuerdos automáticamente.
        // Usamos Start-Process con elevado de permisos.
        const wingetArgs = `install --id ${pkgId} -e --accept-package-agreements --accept-source-agreements`;
        const cmd = `powershell -Command "Start-Process winget -ArgumentList '${wingetArgs}' -Verb RunAs -Wait"`;
        
        console.log(`Instalando dependencia ${depId} vía winget: ${cmd}`);
        await execAsync(cmd);
        
        return { success: true };
      }
      
      return { success: false, error: "La instalación automatizada de esta dependencia solo está soportada en Windows actualmente." };
    } catch (error) {
      console.error(`Error installing dependency ${depId}:`, error);
      return { success: false, error: String(error) };
    }
  });
}
