import { ipcMain } from "electron";
import { execSync } from "node:child_process";
import net from "node:net";
import os from "node:os";
import https from "node:https";
import type {
  SystemCheckResult,
  DockerInfo,
  PlatformCapabilities,
  DeploymentType,
  DiagnosticCheck,
} from "../../types";

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

function isOllamaRunning(): boolean {
  try {
    // Ollama escucha en localhost:11434 por defecto
    execSync("curl -s --max-time 2 http://localhost:11434/api/tags", {
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
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

// ─── Docker Compose ─────────────────────────────────────────────────────────

function getDockerComposeInfo(): { available: boolean; version: string | null } {
  // Primero probar el plugin integrado (docker compose v2)
  try {
    const raw = execSync("docker compose version", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
    const m = raw.match(/v?([\d.]+)/);
    return { available: true, version: m ? m[1] : raw };
  } catch {
    // Fallback: docker-compose standalone (v1)
    try {
      const raw = execSync("docker-compose --version", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 5000,
      }).trim();
      const m = raw.match(/v?([\d.]+)/);
      return { available: true, version: m ? m[1] : raw };
    } catch {
      return { available: false, version: null };
    }
  }
}

// ─── Conectividad a Internet ────────────────────────────────────────────────

function checkInternetConnectivity(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get("https://registry.hub.docker.com/v2/", { timeout: 5000 }, (res) => {
      // Cualquier respuesta (incluso 401) indica conectividad
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
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
      recommendedDeployment = "docker";
    } else if (docker.installed && !docker.running) {
      availableDeployments = ["local", "docker"];
      recommendedDeployment = "docker";
    } else {
      availableDeployments = ["local"];
      recommendedDeployment = "local";
    }
  } else if (os_platform === "win32") {
    // Windows: WSL2 + Docker es la ruta recomendada
    availableDeployments = ["local"];

    if (wsl2Available) {
      availableDeployments.push("wsl2-docker");
      // Con WSL2 disponible, Docker es la ruta recomendada en Windows
      recommendedDeployment = "wsl2-docker";
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

// ─── Motor de Diagnóstico (Fase 2) ─────────────────────────────────────────

interface RawCheckData {
  node: { installed: boolean; version: string | null; meetsRequirement: boolean };
  docker: DockerInfo;
  dockerCompose: { available: boolean; version: string | null };
  ollama: { installed: boolean; version: string | null };
  ollamaRunning: boolean;
  gitInstalled: boolean;
  portAvailable: boolean;
  dashboardPortAvailable: boolean;
  diskSpaceGB: number;
  internetConnected: boolean;
  wsl2Available: boolean;
  platform: string;
}

function buildDiagnostics(data: RawCheckData): DiagnosticCheck[] {
  const checks: DiagnosticCheck[] = [];
  const isWindows = data.platform === "win32";
  const isMac = data.platform === "darwin";
  const isLinux = data.platform === "linux";

  // ─── OS ─────────────────────────────────────────────────────────────

  checks.push({
    id: "os",
    category: "os",
    severity: "critical",
    status: "ready",
    detail: `${isMac ? "macOS" : isLinux ? "Linux" : "Windows"} ${process.arch}`,
  });

  if (isWindows) {
    checks.push({
      id: "wsl2",
      category: "os",
      severity: "critical",
      status: data.wsl2Available ? "ready" : "missing",
      detail: data.wsl2Available
        ? "WSL2 disponible"
        : "WSL2 no detectado — necesario para Docker en Windows",
      fixUrl: data.wsl2Available ? undefined : "https://learn.microsoft.com/en-us/windows/wsl/install",
    });
  }

  // ─── Docker ─────────────────────────────────────────────────────────

  if (data.docker.installed && data.docker.running) {
    checks.push({
      id: "docker",
      category: "docker",
      severity: "critical",
      status: "ready",
      detail: `Docker ${data.docker.version ?? ""} — instalado y ejecutándose`,
    });
  } else if (data.docker.installed && !data.docker.running) {
    checks.push({
      id: "docker",
      category: "docker",
      severity: "critical",
      status: "review",
      detail: `Docker ${data.docker.version ?? ""} instalado pero daemon no activo`,
      fixUrl: isMac
        ? "https://docs.docker.com/desktop/mac/"
        : isWindows
          ? "https://docs.docker.com/desktop/windows/"
          : undefined,
    });
  } else {
    checks.push({
      id: "docker",
      category: "docker",
      severity: "critical",
      status: "missing",
      detail: "Docker no instalado",
      fixUrl: isWindows
        ? "https://www.docker.com/products/docker-desktop"
        : isMac
          ? "https://www.docker.com/products/docker-desktop"
          : "https://get.docker.com",
    });
  }

  // Docker Compose (necesario para desplegar)
  checks.push({
    id: "docker-compose",
    category: "docker",
    severity: "critical",
    status: data.dockerCompose.available ? "ready" : "missing",
    detail: data.dockerCompose.available
      ? `Docker Compose ${data.dockerCompose.version ?? ""}`
      : "Docker Compose no disponible — necesario para desplegar OpenClaw",
    fixUrl: data.dockerCompose.available ? undefined : "https://docs.docker.com/compose/install/",
  });

  // ─── Ollama ─────────────────────────────────────────────────────────

  if (data.ollama.installed) {
    checks.push({
      id: "ollama",
      category: "ollama",
      severity: "optional",
      status: data.ollamaRunning ? "ready" : "review",
      detail: data.ollamaRunning
        ? `Ollama ${data.ollama.version ?? ""} — instalado y ejecutándose`
        : `Ollama ${data.ollama.version ?? ""} instalado pero no ejecutándose`,
      fixUrl: data.ollamaRunning ? undefined : "https://ollama.ai",
    });
  } else {
    checks.push({
      id: "ollama",
      category: "ollama",
      severity: "optional",
      status: "recommended",
      detail: "Ollama no instalado — opcional para modelos locales",
      fixUrl: "https://ollama.ai",
    });
  }

  // ─── Red ────────────────────────────────────────────────────────────

  checks.push({
    id: "internet",
    category: "network",
    severity: "recommended",
    status: data.internetConnected ? "ready" : "missing",
    detail: data.internetConnected
      ? "Conectividad a internet verificada"
      : "Sin conexión a internet — necesaria para descargar imágenes Docker y APIs de IA",
  });

  checks.push({
    id: "port-gateway",
    category: "network",
    severity: "critical",
    status: data.portAvailable ? "ready" : "review",
    detail: data.portAvailable
      ? "Puerto 18789 (gateway) disponible"
      : "Puerto 18789 (gateway) ocupado — necesario para OpenClaw",
  });

  checks.push({
    id: "port-dashboard",
    category: "network",
    severity: "critical",
    status: data.dashboardPortAvailable ? "ready" : "review",
    detail: data.dashboardPortAvailable
      ? "Puerto 3000 (dashboard) disponible"
      : "Puerto 3000 (dashboard) ocupado",
  });

  // ─── Storage ────────────────────────────────────────────────────────

  const diskOk = data.diskSpaceGB >= 5;
  checks.push({
    id: "disk",
    category: "storage",
    severity: "critical",
    status: diskOk ? "ready" : "missing",
    detail: diskOk
      ? `${data.diskSpaceGB} GB libres`
      : `Solo ${data.diskSpaceGB} GB libres — se necesitan al menos 5 GB`,
  });

  // ─── Otros ──────────────────────────────────────────────────────────

  checks.push({
    id: "node",
    category: "os",
    severity: "critical",
    status: data.node.meetsRequirement ? "ready" : "missing",
    detail: data.node.installed
      ? data.node.meetsRequirement
        ? `Node.js ${data.node.version}`
        : `Node.js ${data.node.version} — se requiere v22+`
      : "Node.js no instalado",
    fixUrl: data.node.meetsRequirement ? undefined : "https://nodejs.org/en/download",
  });

  checks.push({
    id: "git",
    category: "os",
    severity: "optional",
    status: data.gitInstalled ? "ready" : "recommended",
    detail: data.gitInstalled
      ? "Git instalado"
      : "Git no instalado — opcional pero recomendado",
    fixUrl: data.gitInstalled ? undefined : "https://git-scm.com/downloads",
  });

  return checks;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export function registerSystemHandlers(): void {
  ipcMain.handle("system:check", async (): Promise<SystemCheckResult> => {
    const node = getNodeVersion();
    const platformCapabilities = getPlatformCapabilities();
    const ollama = getOllamaVersion();
    const dockerCompose = getDockerComposeInfo();

    // Checks en paralelo donde es posible
    const [portAvailable, dashboardPortAvailable, internetConnected] = await Promise.all([
      checkPort(18789),
      checkPort(3000),
      checkInternetConnectivity(),
    ]);

    const diskSpaceGB = getDiskSpaceGB();
    const ollamaRunning = ollama.installed ? isOllamaRunning() : false;

    // Construir diagnósticos estructurados
    const rawData: RawCheckData = {
      node,
      docker: platformCapabilities.docker,
      dockerCompose,
      ollama,
      ollamaRunning,
      gitInstalled: isGitInstalled(),
      portAvailable,
      dashboardPortAvailable,
      diskSpaceGB,
      internetConnected,
      wsl2Available: platformCapabilities.wsl2Available,
      platform: process.platform,
    };

    const diagnostics = buildDiagnostics(rawData);

    return {
      // ── Campos legacy ──
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

      // ── Campos nuevos (Fase 2) ──
      dockerComposeAvailable: dockerCompose.available,
      dockerComposeVersion: dockerCompose.version,
      ollamaRunning,
      dashboardPortAvailable,
      internetConnected,
      diagnostics,
    };
  });

  ipcMain.handle("system:open-url", async (_, url: string) => {
    const { shell } = await import("electron");
    shell.openExternal(url);
  });
}
