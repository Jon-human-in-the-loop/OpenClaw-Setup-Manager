import { ipcMain, BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import type { InstallConfig } from "../../types";

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

// ─── Instalación local (npm global) ─────────────────────────────────────────

async function installLocal(win: BrowserWindow | null, config: InstallConfig): Promise<void> {
  const lang = config.language;
  const isEs = lang === "es";

  // 1. Instalar OpenClaw globalmente
  emit(win, "install:progress", {
    percent: 5,
    message: isEs ? "Descargando OpenClaw..." : "Downloading OpenClaw...",
  } satisfies InstallProgressEvent);

  await runCommand(
    win, "npm",
    ["install", "-g", "openclaw@latest", "--no-fund", "--no-audit"],
    10, 35,
    isEs ? "Instalando OpenClaw..." : "Installing OpenClaw..."
  );

  // 2. Configurar credenciales
  emit(win, "install:progress", {
    percent: 40,
    message: isEs ? "Aplicando configuración..." : "Applying configuration...",
  } satisfies InstallProgressEvent);

  const envPairs: [string, string][] = [
    ["AGENT_NAME", config.agentName],
    ["PRIMARY_MODEL", config.primaryModel],
    ...(config.fallbackModel ? [["FALLBACK_MODEL", config.fallbackModel] as [string, string]] : []),
    ...(config.apiKey ? [["LLM_API_KEY", config.apiKey] as [string, string]] : []),
    ...(config.phoneNumber ? [["WHATSAPP_NUMBER", config.phoneNumber] as [string, string]] : []),
    ...(config.telegramToken ? [["TELEGRAM_BOT_TOKEN", config.telegramToken] as [string, string]] : []),
    ...(config.discordToken ? [["DISCORD_BOT_TOKEN", config.discordToken] as [string, string]] : []),
    // Token de gateway
    ...(config.security.gatewayAuthMode === "token"
      ? [["GATEWAY_TOKEN", config.security.gatewayToken] as [string, string]]
      : []),
    // Forzar solo localhost
    ["GATEWAY_HOST", "127.0.0.1"],
    ["GATEWAY_PORT", "18789"],
  ];

  for (const [key, value] of envPairs) {
    await runCommand(
      win, "openclaw",
      ["config", "set", key, value],
      40, 55,
      isEs ? "Configurando credenciales..." : "Setting credentials..."
    );
  }

  // 3. Si auth por token, habilitarlo
  if (config.security.gatewayAuthMode === "token") {
    await runCommand(
      win, "openclaw",
      ["config", "set", "gateway.auth.mode", "token"],
      56, 58,
      isEs ? "Activando autenticación..." : "Enabling authentication..."
    );
  }

  // 4. Iniciar servicio
  emit(win, "install:progress", {
    percent: 65,
    message: isEs ? "Iniciando servicio..." : "Starting service...",
  } satisfies InstallProgressEvent);

  await runCommand(
    win, "openclaw",
    ["start", "--no-browser"],
    65, 90,
    isEs ? "Iniciando OpenClaw..." : "Starting OpenClaw..."
  );
}

// ─── Instalación Docker ──────────────────────────────────────────────────────

async function installDocker(win: BrowserWindow | null, config: InstallConfig): Promise<void> {
  const lang = config.language;
  const isEs = lang === "es";
  const containerName = `openclaw-${config.agentName.toLowerCase().replace(/\s+/g, "-")}`;

  // 1. Verificar Docker disponible
  emit(win, "install:progress", {
    percent: 5,
    message: isEs ? "Verificando Docker..." : "Checking Docker...",
  } satisfies InstallProgressEvent);

  await runCommand(win, "docker", ["info"], 5, 10, isEs ? "Docker OK" : "Docker OK");

  // 2. Pull imagen de OpenClaw
  emit(win, "install:progress", {
    percent: 15,
    message: isEs ? "Descargando imagen Docker..." : "Pulling Docker image...",
  } satisfies InstallProgressEvent);

  await runCommand(
    win, "docker",
    ["pull", "openclaw/openclaw:latest"],
    15, 45,
    isEs ? "Descargando imagen..." : "Pulling image..."
  );

  // 3. Eliminar contenedor anterior si existe
  try {
    await runCommand(win, "docker", ["rm", "-f", containerName], 45, 47, "");
  } catch {
    // Ignorar si no existía
  }

  // 4. Construir variables de entorno para el contenedor
  const dockerEnv: string[] = [
    "-e", `AGENT_NAME=${config.agentName}`,
    "-e", `PRIMARY_MODEL=${config.primaryModel}`,
    "-e", `GATEWAY_HOST=127.0.0.1`,
    "-e", `GATEWAY_PORT=18789`,
  ];

  if (config.fallbackModel) dockerEnv.push("-e", `FALLBACK_MODEL=${config.fallbackModel}`);
  if (config.apiKey) dockerEnv.push("-e", `LLM_API_KEY=${config.apiKey}`);
  if (config.phoneNumber) dockerEnv.push("-e", `WHATSAPP_NUMBER=${config.phoneNumber}`);
  if (config.telegramToken) dockerEnv.push("-e", `TELEGRAM_BOT_TOKEN=${config.telegramToken}`);
  if (config.discordToken) dockerEnv.push("-e", `DISCORD_BOT_TOKEN=${config.discordToken}`);
  if (config.security.gatewayAuthMode === "token") {
    dockerEnv.push("-e", `GATEWAY_TOKEN=${config.security.gatewayToken}`);
  }

  // 5. Ejecutar contenedor
  // - Solo escucha en localhost (127.0.0.1:18789)
  // - Sin acceso a filesystem del host (no -v)
  // - Reinicio automático
  emit(win, "install:progress", {
    percent: 50,
    message: isEs ? "Iniciando contenedor..." : "Starting container...",
  } satisfies InstallProgressEvent);

  const dockerRunArgs = [
    "run", "-d",
    "--name", containerName,
    "-p", "127.0.0.1:18789:18789",   // Solo localhost, no expuesto a red
    "--restart", "unless-stopped",
    "--memory", "1g",                  // Límite de RAM
    "--cpus", "2",                     // Límite de CPU
    ...dockerEnv,
    "openclaw/openclaw:latest",
  ];

  await runCommand(win, "docker", dockerRunArgs, 50, 90,
    isEs ? "Iniciando contenedor Docker..." : "Starting Docker container..."
  );
}

// ─── Handler principal ───────────────────────────────────────────────────────

export function registerInstallHandlers(win: BrowserWindow | null): void {
  ipcMain.handle("install:start", async (_, config: InstallConfig) => {
    try {
      if (config.deploymentType === "docker" || config.deploymentType === "wsl2-docker") {
        await installDocker(win, config);
      } else {
        await installLocal(win, config);
      }

      emit(win, "install:complete", {
        success: true,
        dashboardUrl: "http://127.0.0.1:18789",
        message: config.language === "es"
          ? "¡OpenClaw instalado correctamente!"
          : "OpenClaw installed successfully!",
      });
    } catch (error) {
      emit(win, "install:complete", {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
