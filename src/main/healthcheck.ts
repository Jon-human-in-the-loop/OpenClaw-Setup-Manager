import { BrowserWindow } from "electron";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createConnection } from "node:net";
import { logAction, setState } from "../db";

const execAsync = promisify(exec);

let healthcheckInterval: ReturnType<typeof setInterval> | null = null;

interface HealthStatus {
  docker: "running" | "stopped" | "unknown";
  openclaw: "running" | "stopped" | "unknown";
  timestamp: string;
}

async function checkDockerRunning(): Promise<boolean> {
  try {
    await execAsync("docker ps --format '{{.ID}}'", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function checkPort(host: string, port: number, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.on("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

async function runHealthcheck(mainWindow: BrowserWindow | null): Promise<void> {
  const dockerRunning = await checkDockerRunning();
  // OpenClaw dashboard is on port 3000 by default
  const openclawRunning = dockerRunning ? await checkPort("127.0.0.1", 3000) : false;

  const status: HealthStatus = {
    docker: dockerRunning ? "running" : "stopped",
    openclaw: openclawRunning ? "running" : "stopped",
    timestamp: new Date().toISOString(),
  };

  // Persist to SQLite
  setState("lastHealthCheck", JSON.stringify(status));

  // Only log degradations to avoid flooding the audit log
  if (!dockerRunning) {
    logAction("healthcheck", "docker=stopped", "warning");
  }
  if (!openclawRunning && dockerRunning) {
    logAction("healthcheck", "openclaw=stopped, docker=running", "warning");
  }

  // Emit to renderer if window is open
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("system:health-update", status);
  }
}

/**
 * Starts the continuous healthcheck loop.
 * Call this once from main/index.ts after the window is created.
 */
export function startHealthcheckLoop(mainWindow: BrowserWindow | null): void {
  if (healthcheckInterval) return; // Already running

  // Run once immediately on startup
  runHealthcheck(mainWindow);

  healthcheckInterval = setInterval(() => {
    runHealthcheck(mainWindow);
  }, 15_000); // Every 15 seconds
}

/**
 * Stops the healthcheck loop (called on app quit).
 */
export function stopHealthcheckLoop(): void {
  if (healthcheckInterval) {
    clearInterval(healthcheckInterval);
    healthcheckInterval = null;
  }
}
