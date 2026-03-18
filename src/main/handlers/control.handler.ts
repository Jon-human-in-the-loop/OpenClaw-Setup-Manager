import { ipcMain, shell } from "electron";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
import http from "node:http";
import type { ContainerStatus, ContainerState, ControlActionResult } from "../../types";

// ─── HELPERS ─────────────────────────────────────────────────

const CONTAINER_NAME = "openclaw-agent";

function getComposePath(): string {
  return join(homedir(), ".openclaw", "docker-compose.yml");
}

/**
 * Hace un HTTP GET rápido y devuelve true si responde con 2xx/3xx.
 */
function quickHttpCheck(url: string, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      const code = res.statusCode ?? 0;
      resolve(code >= 200 && code < 400);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Inspecciona el estado del contenedor usando `docker inspect`.
 */
function inspectContainer(): { state: ContainerState; uptime?: string; containerId?: string; health?: string } {
  try {
    const raw = execSync(
      `docker inspect --format='{{.State.Status}}|{{.State.Health.Status}}|{{.State.StartedAt}}|{{.Id}}' ${CONTAINER_NAME}`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 5000 }
    ).trim();

    // Limpiar comillas simples que a veces envuelve docker en Windows
    const cleaned = raw.replace(/^'|'$/g, "");
    const [status, healthRaw, startedAt, fullId] = cleaned.split("|");

    let containerState: ContainerState;
    switch (status) {
      case "running":
        containerState = "running";
        break;
      case "restarting":
        containerState = "restarting";
        break;
      case "exited":
      case "dead":
      case "paused":
        containerState = "stopped";
        break;
      default:
        containerState = "error";
    }

    // Calcular uptime aproximado
    let uptime: string | undefined;
    if (startedAt && containerState === "running") {
      const startMs = new Date(startedAt).getTime();
      const diffMs = Date.now() - startMs;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      uptime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    const health = healthRaw && healthRaw !== "" && healthRaw !== "<no value>"
      ? healthRaw as "healthy" | "unhealthy" | "starting"
      : "none";

    return {
      state: containerState,
      uptime,
      containerId: fullId ? fullId.substring(0, 12) : undefined,
      health: health as string,
    };
  } catch {
    return { state: "not-found" };
  }
}

// ─── HANDLER ─────────────────────────────────────────────────

export function registerControlHandlers(): void {
  /**
   * control:status — Estado completo del contenedor + alcanzabilidad de endpoints.
   */
  ipcMain.handle("control:status", async (): Promise<ContainerStatus> => {
    const container = inspectContainer();

    // Verificar endpoints en paralelo
    const [dashboardReachable, gatewayReachable] = await Promise.all([
      quickHttpCheck("http://127.0.0.1:3000/healthz"),
      quickHttpCheck("http://127.0.0.1:18789"),
    ]);

    return {
      state: container.state,
      uptime: container.uptime,
      containerId: container.containerId,
      health: container.health as ContainerStatus["health"],
      dashboardReachable,
      gatewayReachable,
      lastCheckedAt: Date.now(),
    };
  });

  /**
   * control:start — Levanta el contenedor.
   */
  ipcMain.handle("control:start", async (): Promise<ControlActionResult> => {
    const composePath = getComposePath();
    if (!existsSync(composePath)) {
      return {
        success: false,
        action: "start",
        message: "No se encontró docker-compose.yml. ¿Se ha ejecutado el wizard?",
      };
    }

    try {
      execSync(`docker compose -f "${composePath}" up -d`, {
        encoding: "utf8",
        timeout: 30000,
      });
      return {
        success: true,
        action: "start",
        message: "Contenedor iniciado correctamente.",
      };
    } catch (err) {
      return {
        success: false,
        action: "start",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });

  /**
   * control:stop — Detiene el contenedor.
   */
  ipcMain.handle("control:stop", async (): Promise<ControlActionResult> => {
    try {
      execSync(`docker stop ${CONTAINER_NAME}`, {
        encoding: "utf8",
        timeout: 15000,
      });
      return {
        success: true,
        action: "stop",
        message: "Contenedor detenido.",
      };
    } catch (err) {
      return {
        success: false,
        action: "stop",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });

  /**
   * control:restart — Reinicia el contenedor.
   */
  ipcMain.handle("control:restart", async (): Promise<ControlActionResult> => {
    const composePath = getComposePath();
    try {
      execSync(`docker compose -f "${composePath}" restart`, {
        encoding: "utf8",
        timeout: 30000,
      });
      return {
        success: true,
        action: "restart",
        message: "Contenedor reiniciado.",
      };
    } catch (err) {
      return {
        success: false,
        action: "restart",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });

  /**
   * control:logs — Últimas N líneas de logs del contenedor.
   */
  ipcMain.handle("control:logs", async (_, lines = 100): Promise<ControlActionResult> => {
    try {
      const logs = execSync(`docker logs --tail ${lines} ${CONTAINER_NAME}`, {
        encoding: "utf8",
        timeout: 10000,
      });
      return {
        success: true,
        action: "logs",
        message: `Últimas ${lines} líneas de logs`,
        data: logs,
      };
    } catch (err) {
      return {
        success: false,
        action: "logs",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });

  /**
   * control:open-dashboard — Abre el dashboard en el navegador del sistema.
   */
  ipcMain.handle("control:open-dashboard", async (): Promise<ControlActionResult> => {
    try {
      await shell.openExternal("http://127.0.0.1:3000");
      return {
        success: true,
        action: "open-dashboard",
        message: "Dashboard abierto en el navegador.",
      };
    } catch (err) {
      return {
        success: false,
        action: "open-dashboard",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });

  /**
   * control:open-config — Abre la carpeta de configuración en el explorador de archivos.
   */
  ipcMain.handle("control:open-config", async (): Promise<ControlActionResult> => {
    const configDir = join(homedir(), ".openclaw");
    try {
      await shell.openPath(configDir);
      return {
        success: true,
        action: "open-config",
        message: "Carpeta de configuración abierta.",
      };
    } catch (err) {
      return {
        success: false,
        action: "open-config",
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });
}
