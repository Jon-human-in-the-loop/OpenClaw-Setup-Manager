import { ipcMain, BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import { homedir, platform } from "node:os";
import { writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import http from "node:http";
import type { InstallConfig, HealthcheckResult } from "../../types";

type InstallProgressEvent = {
  percent: number;
  message: string;
  log?: string;
};

function emit(win: BrowserWindow | null, channel: string, data: unknown): void {
  win?.webContents.send(channel, data);
}

function runCommand(
  win: BrowserWindow | null,
  command: string,
  args: string[],
  startPercent: number,
  endPercent: number,
  label: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: true,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    child.stdout.on("data", (data: Buffer) => {
      const line = data.toString().trim();
      if (line) {
        emit(win, "install:progress", {
          percent: startPercent,
          message: label,
          log: line,
        } satisfies InstallProgressEvent);
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      const line = data.toString().trim();
      if (line) {
        emit(win, "install:progress", {
          percent: startPercent,
          message: label,
          log: `[stderr] ${line}`,
        } satisfies InstallProgressEvent);
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        emit(win, "install:progress", {
          percent: endPercent,
          message: label,
        } satisfies InstallProgressEvent);
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(" ")}" exited with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

// ─── DOCKER HELPERS ──────────────────────────────────────────

async function isDockerInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("docker", ["--version"], { shell: true });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

async function installDocker(
  win: BrowserWindow | null,
  startPercent: number,
  endPercent: number
): Promise<void> {
  const os = platform();

  if (os === "darwin") {
    await runCommand(
      win,
      "curl",
      [
        "-L",
        "$(uname -m | grep -q arm64 && echo https://desktop.docker.com/mac/main/arm64/Docker.dmg || echo https://desktop.docker.com/mac/main/amd64/Docker.dmg)",
        "-o",
        "/tmp/Docker.dmg",
        "--progress-bar",
      ],
      startPercent,
      startPercent + 30,
      "Descargando Docker Desktop..."
    );

    await runCommand(
      win,
      "hdiutil",
      ["attach", "/tmp/Docker.dmg"],
      startPercent + 30,
      startPercent + 50,
      "Instalando Docker Desktop..."
    );

    await runCommand(
      win,
      "cp",
      ["-r", "/Volumes/Docker/Docker.app", "/Applications/"],
      startPercent + 50,
      startPercent + 70,
      "Copiando aplicación..."
    );

    await runCommand(
      win,
      "hdiutil",
      ["detach", "/Volumes/Docker"],
      startPercent + 70,
      endPercent,
      "Finalizando instalación..."
    );
  } else if (os === "win32") {
    await runCommand(
      win,
      "powershell",
      [
        "-Command",
        "wsl sudo apt-get update && wsl sudo apt-get install -y docker.io docker-compose-v2",
      ],
      startPercent,
      endPercent,
      "Instalando Docker en WSL2..."
    );
  } else {
    await runCommand(
      win,
      "curl",
      ["-fsSL", "https://get.docker.com"],
      startPercent,
      startPercent + 50,
      "Descargando Docker..."
    );

    await runCommand(
      win,
      "sh",
      ["-c", "curl -fsSL https://get.docker.com | sudo sh"],
      startPercent + 50,
      endPercent,
      "Instalando Docker..."
    );
  }
}

// ─── CONFIGURATION GENERATORS ────────────────────────────────

function generateGatewayToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateOpenClawConfig(config: InstallConfig, gatewayToken: string): string {
  const channels: Record<string, unknown> = {};

  if (config.phoneNumber) {
    channels.whatsapp = {
      allowFrom: [config.phoneNumber],
      groups: { "*": { requireMention: true } },
    };
  }

  if (config.telegramToken) {
    channels.telegram = {
      enabled: true,
      botToken: config.telegramToken,
      allowFrom: ["YOUR_TELEGRAM_USER_ID"],
      groups: { "*": { requireMention: true } },
    };
  }

  if (config.discordToken) {
    channels.discord = {
      enabled: true,
      token: config.discordToken,
      dm: { enabled: true, allowFrom: ["YOUR_DISCORD_USER_ID"] },
    };
  }

  return JSON.stringify(
    {
      identity: {
        name: config.agentName || "Clawd",
        emoji: "🦞",
      },
      agent: {
        workspace: "/home/node/.openclaw/workspace",
        model: config.primaryModel,
        ...(config.fallbackModel ? { fallbacks: [config.fallbackModel] } : {}),
      },
      gateway: {
        port: 18789,
        bind: "loopback",
        mode: "local",
        auth: {
          token: gatewayToken,
        },
      },
      agents: {
        defaults: {
          sandbox: {
            mode: "non-main",
          },
        },
      },
      channels,
      session: {
        scope: "per-sender",
        reset: {
          mode: "daily",
          atHour: 4,
        },
      },
    },
    null,
    2
  );
}

function generateDockerCompose(): string {
  return `version: "3.8"

services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-agent
    restart: unless-stopped

    # SECURITY: Localhost only
    ports:
      - "127.0.0.1:18789:18789"
      - "127.0.0.1:3000:3000"

    # Volumes
    volumes:
      - \${HOME}/.openclaw/openclaw.json:/home/node/.openclaw/openclaw.json:ro
      - \${HOME}/.openclaw/workspace:/home/node/.openclaw/workspace
      - \${HOME}/.openclaw/skills:/home/node/.openclaw/skills
      - \${HOME}/.openclaw/.env:/home/node/.openclaw/.env:ro

    # SECURITY: Read-only filesystem
    read_only: true
    tmpfs:
      - /tmp:size=128m,mode=1777

    # SECURITY: No capabilities
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true

    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
`;
}

// ─── HEALTHCHECK ─────────────────────────────────────────────

/**
 * Realiza un healthcheck HTTP real contra un endpoint local.
 * Reintenta hasta `maxRetries` veces con `intervalMs` entre intentos.
 */
export function performHealthcheck(
  url: string,
  maxRetries = 12,
  intervalMs = 5000
): Promise<HealthcheckResult> {
  return new Promise((resolve) => {
    let attempts = 0;

    function attempt(): void {
      attempts++;
      const startTime = Date.now();

      const req = http.get(url, { timeout: 5000 }, (res) => {
        const responseTimeMs = Date.now() - startTime;
        const statusCode = res.statusCode ?? 0;
        res.resume();

        if (statusCode >= 200 && statusCode < 400) {
          resolve({
            healthy: true,
            responseTimeMs,
            statusCode,
          });
        } else if (attempts < maxRetries) {
          setTimeout(attempt, intervalMs);
        } else {
          resolve({
            healthy: false,
            responseTimeMs,
            statusCode,
            error: `Received status ${statusCode} after ${attempts} attempts`,
          });
        }
      });

      req.on("error", (err) => {
        if (attempts < maxRetries) {
          setTimeout(attempt, intervalMs);
        } else {
          resolve({
            healthy: false,
            error: `${err.message} (after ${attempts} attempts)`,
          });
        }
      });

      req.on("timeout", () => {
        req.destroy();
        if (attempts < maxRetries) {
          setTimeout(attempt, intervalMs);
        } else {
          resolve({
            healthy: false,
            error: `Timeout after ${attempts} attempts`,
          });
        }
      });
    }

    attempt();
  });
}

// ─── MAIN INSTALLATION HANDLER ───────────────────────────────

export function registerInstallHandlers(win: BrowserWindow | null): void {
  ipcMain.handle("install:start", async (_, config: InstallConfig) => {
    const homeDir = homedir();
    const openClawDir = join(homeDir, ".openclaw");

    try {
      // PASO 1: Verificar/Instalar Docker
      emit(win, "install:progress", {
        percent: 5,
        message:
          config.language === "es"
            ? "Verificando Docker..."
            : "Checking Docker...",
      } satisfies InstallProgressEvent);

      const dockerExists = await isDockerInstalled();

      if (!dockerExists) {
        emit(win, "install:progress", {
          percent: 10,
          message:
            config.language === "es"
              ? "Instalando Docker..."
              : "Installing Docker...",
        } satisfies InstallProgressEvent);

        await installDocker(win, 10, 35);
      }

      // PASO 2: Crear estructura de directorios
      emit(win, "install:progress", {
        percent: 40,
        message:
          config.language === "es"
            ? "Creando directorios..."
            : "Creating directories...",
      } satisfies InstallProgressEvent);

      mkdirSync(join(openClawDir, "workspace"), { recursive: true });
      mkdirSync(join(openClawDir, "skills"), { recursive: true });

      // PASO 3: Generar token de gateway
      const gatewayToken = generateGatewayToken();

      // PASO 4: Escribir configuración
      emit(win, "install:progress", {
        percent: 50,
        message:
          config.language === "es"
            ? "Escribiendo configuración..."
            : "Writing configuration...",
      } satisfies InstallProgressEvent);

      const configJson = generateOpenClawConfig(config, gatewayToken);
      const configPath = join(openClawDir, "openclaw.json");
      writeFileSync(configPath, configJson, "utf-8");
      chmodSync(configPath, 0o600);

      const tokenPath = join(openClawDir, ".gateway-token");
      writeFileSync(tokenPath, gatewayToken, "utf-8");
      chmodSync(tokenPath, 0o600);

      // PASO 5: Escribir .env con API keys
      if (config.apiKey) {
        const envContent = `LLM_API_KEY=${config.apiKey}`;
        const envPath = join(openClawDir, ".env");
        writeFileSync(envPath, envContent, "utf-8");
        chmodSync(envPath, 0o600);
      }

      // PASO 6: Escribir docker-compose.yml
      emit(win, "install:progress", {
        percent: 60,
        message:
          config.language === "es"
            ? "Configurando Docker..."
            : "Configuring Docker...",
      } satisfies InstallProgressEvent);

      const dockerCompose = generateDockerCompose();
      const composePath = join(openClawDir, "docker-compose.yml");
      writeFileSync(composePath, dockerCompose, "utf-8");
      chmodSync(composePath, 0o600);

      // PASO 7: Levantar contenedor
      emit(win, "install:progress", {
        percent: 70,
        message:
          config.language === "es"
            ? "Iniciando contenedor..."
            : "Starting container...",
      } satisfies InstallProgressEvent);

      await runCommand(
        win,
        "docker",
        ["compose", "-f", composePath, "pull"],
        70,
        75,
        config.language === "es" ? "Descargando imagen..." : "Downloading image..."
      );

      await runCommand(
        win,
        "docker",
        ["compose", "-f", composePath, "up", "-d"],
        75,
        85,
        config.language === "es" ? "Levantando contenedor..." : "Starting container..."
      );

      // PASO 8: Healthcheck real (reemplaza el antiguo setTimeout)
      emit(win, "install:progress", {
        percent: 88,
        message:
          config.language === "es"
            ? "Verificando que OpenClaw responda..."
            : "Verifying OpenClaw is responding...",
      } satisfies InstallProgressEvent);

      const dashboardHealth = await performHealthcheck("http://127.0.0.1:3000/healthz", 12, 5000);
      const gatewayHealth = await performHealthcheck("http://127.0.0.1:18789", 3, 2000);

      if (dashboardHealth.healthy) {
        emit(win, "install:progress", {
          percent: 95,
          message:
            config.language === "es"
              ? `Dashboard operativo (${dashboardHealth.responseTimeMs}ms)`
              : `Dashboard operational (${dashboardHealth.responseTimeMs}ms)`,
        } satisfies InstallProgressEvent);
      }

      // ✅ Completado
      emit(win, "install:complete", {
        success: true,
        dashboardUrl: "http://127.0.0.1:3000",
        message:
          config.language === "es"
            ? dashboardHealth.healthy
              ? "¡OpenClaw instalado y verificado correctamente!"
              : "OpenClaw instalado. Dashboard aún iniciando — puede tardar unos segundos más."
            : dashboardHealth.healthy
              ? "OpenClaw installed and verified successfully!"
              : "OpenClaw installed. Dashboard still starting — may take a few more seconds.",
        healthcheck: {
          dashboard: dashboardHealth,
          gateway: gatewayHealth,
        },
      });
    } catch (error) {
      emit(win, "install:complete", {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
