import { ipcMain } from "electron";
import { execSync } from "node:child_process";
import net from "node:net";
import os from "node:os";
import type { SystemCheckResult, DockerInfo, PlatformCapabilities, DeploymentType } from "../../types";

// ─── Node.js ────────────────────────────────────────────────────────────────

function getNodeVersion(): { installed: boolean; version: string | null; meetsRequirement: boolean } {
  try {
    const raw = execSync("node --version", { encoding: "utf8" }).trim();
    const match = raw.match(/^v?(\d+)\./);
    const major = match ? parseInt(match[1], 10) : 0;
    return { installed: true, version: raw, meetsRequirement: major >= 22 };
  } catch {
    return { installed: false, version: null, meetsRequirement: false };
  }
}

// ─── Puerto ──────────────────────────────────────────────────────────────────

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

// ─── Disco ───────────────────────────────────────────────────────────────────

function getDiskSpaceGB(): number {
  try {
    if (process.platform === "win32") {
      const out = execSync("wmic logicaldisk get size,freespace /format:csv", { encoding: "utf8" });
      const lines = out.trim().split("\n").filter(Boolean);
      if (lines.length >= 2) {
        const parts = lines[1].split(",");
        const freeBytes = parseInt(parts[1] || "0", 10);
        return Math.floor(freeBytes / (1024 ** 3));
      }
      return 0;
    } else {
      const out = execSync(`df -k "${os.homedir()}"`, { encoding: "utf8" });
      const lines = out.trim().split("\n");
      const parts = lines[1].split(/\s+/);
      const freeKB = parseInt(parts[3] || "0", 10);
      return Math.floor(freeKB / (1024 ** 2));
    }
  } catch {
    return 100;
  }
}

// ─── Git ─────────────────────────────────────────────────────────────────────

function isGitInstalled(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ─── Ollama ──────────────────────────────────────────────────────────────────

function getOllamaVersion(): { installed: boolean; version: string | null } {
  try {
    const raw = execSync("ollama --version", { encoding: "utf8" }).trim();
    return { installed: true, version: raw };
  } catch {
    return { installed: false, version: null };
  }
}

// ─── Docker ──────────────────────────────────────────────────────────────────

function getDockerInfo(): DockerInfo {
  const isNative = process.platform === "linux";

  // 1. ¿Está instalado?
  let installed = false;
  let version: string | undefined;
  try {
    const raw = execSync("docker --version", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
    installed = true;
    // "Docker version 24.0.7, build afdd53b"
    const m = raw.match(/version\s+([\d.]+)/i);
    version = m ? m[1] : raw;
  } catch {
    installed = false;
  }

  if (!installed) {
    return { installed: false, running: false, isNative };
  }

  // 2. ¿Está corriendo (daemon activo)?
  let running = false;
  try {
    execSync("docker info", { stdio: "ignore", timeout: 5000 });
    running = true;
  } catch {
    running = false;
  }

  return { installed, running, version, isNative };
}

// ─── WSL2 (solo Windows) ─────────────────────────────────────────────────────

function checkWSL2(): boolean {
  if (process.platform !== "win32") return false;
  try {
    const out = execSync("wsl --status", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 5000 });
    // Si no lanza error y contiene algún texto de versión, WSL2 está disponible
    return out.toLowerCase().includes("wsl") || out.trim().length > 0;
  } catch {
    try {
      // Fallback: intenta listar distros
      execSync("wsl -l -v", { stdio: "ignore", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Capacidades de Plataforma ───────────────────────────────────────────────

function getPlatformCapabilities(): PlatformCapabilities {
  const os_platform = process.platform;
  const docker = getDockerInfo();
  const wsl2Available = checkWSL2();

  let availableDeployments: DeploymentType[] = ["local"];
  let recommendedDeployment: DeploymentType = "local";

  if (os_platform === "linux" || os_platform === "darwin") {
    // macOS y Linux: Docker es una opción real
    if (docker.installed && docker.running) {
      availableDeployments = ["local", "docker"];
      // En Linux preferimos Docker por seguridad; en macOS es conveniente también
      recommendedDeployment = "docker";
    } else if (docker.installed && !docker.running) {
      // Docker instalado pero no activo: aún lo ofrecemos, avisamos que hay que iniciarlo
      availableDeployments = ["local", "docker"];
      recommendedDeployment = "docker";
    } else {
      // Docker no instalado: solo local, pero ofrecemos instalarlo
      availableDeployments = ["local"];
      recommendedDeployment = "local";
    }
  } else if (os_platform === "win32") {
    // Windows: local es el principal
    availableDeployments = ["local"];
    recommendedDeployment = "local";

    if (wsl2Available) {
      availableDeployments.push("wsl2-docker");
      // En Windows no cambiamos la recomendación: local sigue siendo la opción
      // principal para usuarios no técnicos; WSL2 es "avanzado"
    }
  }

  return {
    os: os_platform,
    arch: process.arch,
    docker,
    wsl2Available,
    availableDeployments,
    recommendedDeployment,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export function registerSystemHandlers(): void {
  ipcMain.handle("system:check", async (): Promise<SystemCheckResult> => {
    const node = getNodeVersion();
    const portAvailable = await checkPort(18789);
    const diskSpaceGB = getDiskSpaceGB();
    const platformCapabilities = getPlatformCapabilities();
    const ollama = getOllamaVersion();

    return {
      nodeInstalled: node.installed,
      nodeVersion: node.version,
      nodeMeetsRequirement: node.meetsRequirement,
      portAvailable,
      diskSpaceGB,
      diskSpaceMeetsRequirement: diskSpaceGB >= 5,
      gitInstalled: isGitInstalled(),
      ollamaInstalled: ollama.installed,
      ollamaVersion: ollama.version,
      platform: process.platform,
      arch: process.arch,
      platformCapabilities,
    };
  });

  ipcMain.handle("system:open-url", async (_, url: string) => {
    const { shell } = await import("electron");
    shell.openExternal(url);
  });
}
