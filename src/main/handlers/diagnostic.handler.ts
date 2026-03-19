import { ipcMain, dialog } from "electron";
import { execSync } from "node:child_process";
import { homedir, platform, release, arch, totalmem, freemem } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
// We'll use a simple node archiver or just zip command if available, or write a JSON text file for now to avoid adding heavy dependencies if not needed.
// For simplicity in this local platform, let's export a single structured JSON file or a combined text file.
import type { ControlActionResult } from "../../types";

const CONTAINER_NAME = "openclaw-agent";

function maskSecretsInText(text: string): string {
  if (!text) return "";
  return text
    .replace(/(Bearer\\s+)[a-zA-Z0-9\\-_\\.]+/g, "$1********")
    .replace(/(token["']?\\s*:\\s*["'])[a-zA-Z0-9\\-_]+(["'])/g, "$1********$2")
    .replace(/(api[_-]?key["']?\\s*:\\s*["'])[a-zA-Z0-9\\-_]+(["'])/gi, "$1********$2")
    .replace(/(sk-[a-zA-Z0-9]{40,})/g, "sk-********")
    .replace(/^([A-Z0-9_]+(?:KEY|TOKEN|SECRET|PASSWORD))=(.*)$/gm, "$1=******** (Hidden for security) ********");
}

export function registerDiagnosticHandlers(): void {
  ipcMain.handle("diagnostic:export", async (): Promise<ControlActionResult> => {
    try {
      const openclawDir = join(homedir(), ".openclaw");
      
      // 1. Gather System Info
      const sysInfo = {
        os: `${platform()} ${release()} ${arch()}`,
        memory: `Total: ${(totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB, Free: ${(freemem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
        nodeVersion: process.version,
      };

      // 2. Gather Docker Info & Logs
      let dockerVersion = "Unknown";
      let containerState = "Unknown";
      let containerLogs = "";

      try {
        dockerVersion = execSync("docker --version", { encoding: "utf8", timeout: 5000 }).trim();
      } catch (e) {
        dockerVersion = "Error reading docker version";
      }

      try {
        containerState = execSync(`docker inspect --format='{{json .State}}' ${CONTAINER_NAME}`, { encoding: "utf8", timeout: 5000 }).trim();
      } catch (e) {
        containerState = "Error reading container state";
      }

      try {
        containerLogs = execSync(`docker logs --tail 500 ${CONTAINER_NAME}`, { encoding: "utf8", timeout: 10000 });
      } catch (e) {
        containerLogs = "Error reading container logs";
      }

      // 3. Gather Configurations
      let envContent = "File not found";
      let composeContent = "File not found";
      let openclawJsonContent = "File not found";
      let stateJsonContent = "File not found";

      const loadFileStr = (name: string) => {
        const p = join(openclawDir, name);
        return existsSync(p) ? readFileSync(p, "utf-8") : "File not found";
      };

      envContent = loadFileStr(".env");
      composeContent = loadFileStr("docker-compose.yml");
      openclawJsonContent = loadFileStr("openclaw.json");
      stateJsonContent = loadFileStr("state.json");

      // 4. Combine and Mask
      const diagnosticReport = {
        timestamp: new Date().toISOString(),
        system: sysInfo,
        docker: {
          version: dockerVersion,
          agentState: containerState,
        },
        configs: {
          env: maskSecretsInText(envContent),
          compose: composeContent,
          openclawJson: maskSecretsInText(openclawJsonContent),
          stateJson: stateJsonContent,
        },
        logs: {
          agentLogs: maskSecretsInText(containerLogs),
        }
      };

      const finalOutput = JSON.stringify(diagnosticReport, null, 2);

      // 5. Ask User Where to Save
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Exportar Diagnóstico de OpenClaw",
        defaultPath: "openclaw-diagnostic.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (canceled || !filePath) {
        return { success: false, action: "logs", message: "Exportación cancelada." }; // Reusing ControlAction type fields somewhat loosely or we can add a new specific type
      }

      writeFileSync(filePath, finalOutput, "utf-8");

      return {
        success: true,
        action: "logs",
        message: `Diagnóstico guardado en ${filePath}`,
        data: filePath,
      };

    } catch (err) {
      console.error("Diagnostic export error:", err);
      return {
        success: false,
        action: "logs",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });
}
