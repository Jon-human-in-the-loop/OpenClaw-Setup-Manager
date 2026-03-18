import { ipcMain } from "electron";
import { execSync } from "node:child_process";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { existsSync, writeFileSync, chmodSync } from "node:fs";
import net from "node:net";
import type { RepairIssue, RepairResult } from "../../types";

// ─── HELPERS ─────────────────────────────────────────────────

const CONTAINER_NAME = "openclaw-agent";

function getOpenClawDir(): string {
  return join(homedir(), ".openclaw");
}

function isDockerDaemonRunning(): boolean {
  try {
    execSync("docker info", { stdio: "ignore", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function isContainerRunning(): boolean {
  try {
    const out = execSync(
      `docker inspect --format='{{.State.Running}}' ${CONTAINER_NAME}`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 5000 }
    ).trim().replace(/'/g, "");
    return out === "true";
  } catch {
    return false;
  }
}

function containerExists(): boolean {
  try {
    execSync(`docker inspect ${CONTAINER_NAME}`, {
      stdio: "ignore",
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

// ─── DIAGNOSE ────────────────────────────────────────────────

async function runDiagnosis(): Promise<RepairIssue[]> {
  const issues: RepairIssue[] = [];
  const openClawDir = getOpenClawDir();

  // 1. Docker daemon
  if (!isDockerDaemonRunning()) {
    issues.push({
      id: "docker-not-running",
      severity: "critical",
      title: "Docker no está ejecutándose",
      description: "El demonio de Docker no responde. Sin Docker, OpenClaw no puede funcionar.",
      autoFixable: platform() === "linux",
    });
  }

  // 2. Contenedor
  if (isDockerDaemonRunning()) {
    if (!containerExists()) {
      issues.push({
        id: "container-missing",
        severity: "critical",
        title: "Contenedor OpenClaw no encontrado",
        description: "El contenedor 'openclaw-agent' no existe. Puede que no se haya instalado o se eliminó.",
        autoFixable: existsSync(join(openClawDir, "docker-compose.yml")),
      });
    } else if (!isContainerRunning()) {
      issues.push({
        id: "container-stopped",
        severity: "critical",
        title: "Contenedor detenido",
        description: "El contenedor OpenClaw existe pero no está corriendo.",
        autoFixable: true,
      });
    }
  }

  // 3. Puertos
  const [gatewayFree, dashboardFree] = await Promise.all([
    isPortAvailable(18789),
    isPortAvailable(3000),
  ]);

  // Solo reportar conflicto si el puerto está ocupado Y el contenedor NO está corriendo
  // (si está corriendo, es el propio OpenClaw quien ocupa los puertos)
  const containerRunning = isDockerDaemonRunning() && isContainerRunning();

  if (!gatewayFree && !containerRunning) {
    issues.push({
      id: "port-gateway-occupied",
      severity: "critical",
      title: "Puerto 18789 ocupado",
      description: "El puerto del gateway está ocupado por otro proceso.",
      autoFixable: false,
    });
  }

  if (!dashboardFree && !containerRunning) {
    issues.push({
      id: "port-dashboard-occupied",
      severity: "recommended",
      title: "Puerto 3000 ocupado",
      description: "El puerto del dashboard está ocupado por otro proceso.",
      autoFixable: false,
    });
  }

  // 4. Archivos de configuración
  if (!existsSync(join(openClawDir, ".env"))) {
    issues.push({
      id: "env-missing",
      severity: "recommended",
      title: "Archivo .env no encontrado",
      description: "El archivo de variables de entorno no existe. Se puede regenerar.",
      autoFixable: true,
    });
  }

  if (!existsSync(join(openClawDir, "openclaw.json"))) {
    issues.push({
      id: "config-missing",
      severity: "critical",
      title: "Configuración de OpenClaw no encontrada",
      description: "El archivo openclaw.json no existe. Necesario para ejecutar OpenClaw.",
      autoFixable: false,
    });
  }

  if (!existsSync(join(openClawDir, "docker-compose.yml"))) {
    issues.push({
      id: "compose-missing",
      severity: "critical",
      title: "docker-compose.yml no encontrado",
      description: "El archivo de orquestación Docker no existe. Ejecute el wizard nuevamente.",
      autoFixable: false,
    });
  }

  return issues;
}

// ─── FIX FUNCTIONS ───────────────────────────────────────────

function fixDockerDaemon(): RepairResult {
  const os = platform();
  try {
    if (os === "linux") {
      execSync("sudo systemctl start docker", { timeout: 15000 });
      return {
        issue: "docker-not-running",
        success: true,
        message: "Docker daemon iniciado con systemctl.",
        technicalDetail: "sudo systemctl start docker",
      };
    } else if (os === "darwin") {
      execSync("open -a Docker", { timeout: 10000 });
      return {
        issue: "docker-not-running",
        success: true,
        message: "Docker Desktop abierto. Puede tardar unos segundos en iniciar.",
        technicalDetail: "open -a Docker",
      };
    } else {
      return {
        issue: "docker-not-running",
        success: false,
        message: "En Windows, abre Docker Desktop manualmente desde el menú Inicio.",
      };
    }
  } catch (err) {
    return {
      issue: "docker-not-running",
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

function fixContainerStopped(): RepairResult {
  try {
    execSync(`docker start ${CONTAINER_NAME}`, { timeout: 15000 });
    return {
      issue: "container-stopped",
      success: true,
      message: "Contenedor reiniciado correctamente.",
      technicalDetail: `docker start ${CONTAINER_NAME}`,
    };
  } catch (err) {
    return {
      issue: "container-stopped",
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

function fixContainerMissing(): RepairResult {
  const composePath = join(getOpenClawDir(), "docker-compose.yml");
  if (!existsSync(composePath)) {
    return {
      issue: "container-missing",
      success: false,
      message: "No se puede recrear sin docker-compose.yml. Ejecute el wizard.",
    };
  }

  try {
    execSync(`docker compose -f "${composePath}" up -d`, {
      encoding: "utf8",
      timeout: 60000,
    });
    return {
      issue: "container-missing",
      success: true,
      message: "Contenedor recreado desde docker-compose.yml.",
      technicalDetail: `docker compose -f "${composePath}" up -d`,
    };
  } catch (err) {
    return {
      issue: "container-missing",
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

function fixEnvMissing(): RepairResult {
  const envPath = join(getOpenClawDir(), ".env");
  try {
    writeFileSync(envPath, "# OpenClaw Environment\n# LLM_API_KEY=your_key_here\n", "utf-8");
    chmodSync(envPath, 0o600);
    return {
      issue: "env-missing",
      success: true,
      message: "Archivo .env base regenerado. Edítalo para añadir tu API key.",
      technicalDetail: `Creado ${envPath} con permisos 600`,
    };
  } catch (err) {
    return {
      issue: "env-missing",
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── HANDLER ─────────────────────────────────────────────────

export function registerRepairHandlers(): void {
  /**
   * repair:diagnose — Ejecuta un diagnóstico completo y devuelve los problemas encontrados.
   */
  ipcMain.handle("repair:diagnose", async (): Promise<RepairIssue[]> => {
    return runDiagnosis();
  });

  /**
   * repair:fix — Intenta reparar un problema específico identificado por su ID.
   */
  ipcMain.handle("repair:fix", async (_, issueId: string): Promise<RepairResult> => {
    switch (issueId) {
      case "docker-not-running":
        return fixDockerDaemon();
      case "container-stopped":
        return fixContainerStopped();
      case "container-missing":
        return fixContainerMissing();
      case "env-missing":
        return fixEnvMissing();
      default:
        return {
          issue: issueId as RepairResult["issue"],
          success: false,
          message: `No hay reparación automática disponible para "${issueId}".`,
        };
    }
  });

  /**
   * repair:fix-all — Intenta reparar todos los problemas autoFixable.
   */
  ipcMain.handle("repair:fix-all", async (): Promise<RepairResult[]> => {
    const issues = await runDiagnosis();
    const fixable = issues.filter((i) => i.autoFixable);
    const results: RepairResult[] = [];

    for (const issue of fixable) {
      // Usar el handler individual para cada fix
      let result: RepairResult;
      switch (issue.id) {
        case "docker-not-running":
          result = fixDockerDaemon();
          break;
        case "container-stopped":
          result = fixContainerStopped();
          break;
        case "container-missing":
          result = fixContainerMissing();
          break;
        case "env-missing":
          result = fixEnvMissing();
          break;
        default:
          result = {
            issue: issue.id,
            success: false,
            message: `Sin reparación automática para "${issue.id}".`,
          };
      }
      results.push(result);
    }

    return results;
  });
}
