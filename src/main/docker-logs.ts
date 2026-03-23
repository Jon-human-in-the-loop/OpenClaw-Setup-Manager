import { spawn, ChildProcess } from "node:child_process";
import { insertContainerLog } from "./db";
import { BrowserWindow } from "electron";

let logProcess: ChildProcess | null = null;

export function startDockerLogStream(containerName: string, win: BrowserWindow | null): void {
  if (logProcess) {
    logProcess.kill();
  }

  // Follow logs starting from the last 200 lines to catch up since last start
  // Docker timestamps are included for accuracy.
  logProcess = spawn("docker", ["logs", "--follow", "--timestamps", "--tail", "200", containerName], {
    shell: true,
  });

  const handleLine = (data: Buffer, defaultLevel: "INFO" | "ERROR") => {
    const lines = data.toString().split("\n");
    for (const rawLine of lines) {
      if (!rawLine.trim()) continue;

      let level = defaultLevel;
      const upperLine = rawLine.toUpperCase();

      // Heuristic for log levels if the container doesn't use JSON logs
      if (
        upperLine.includes("ERROR") ||
        upperLine.includes("EXCEPTION") ||
        upperLine.includes("FATAL") ||
        upperLine.includes("FAIL")
      ) {
        level = "ERROR";
      } else if (upperLine.includes("WARN")) {
        level = "WARN";
      }

      // Feature 2: Persistent Dual-Layer Logging
      // Solo guardamos ERRORES y WARNINGS en la BD SQLite para evitar saturarla con logs triviales y
      // permitir un análisis post-mortem forense de qué pasó hace días.
      if (level === "ERROR" || level === "WARN") {
        insertContainerLog(containerName, rawLine.substring(0, 2000), level);
      }

      // We only send real-time logs to the UI if requested, but for now we rely on the UI polling the DB
      // or using the `control:container-logs` handler.
    }
  };

  logProcess.stdout?.on("data", (data: Buffer) => handleLine(data, "INFO"));
  logProcess.stderr?.on("data", (data: Buffer) => handleLine(data, "ERROR"));

  logProcess.on("close", () => {
    logProcess = null;
    // Auto-restart? Maybe not needed if the app restarts it periodically or if it only dies when container dies.
  });
  
  logProcess.on("error", (err) => {
    console.error("Failed to start docker log stream:", err);
  });
}

export function stopDockerLogStream(): void {
  if (logProcess) {
    logProcess.kill();
    logProcess = null;
  }
}
