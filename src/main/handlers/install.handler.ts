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

export function registerInstallHandlers(win: BrowserWindow | null): void {
  ipcMain.handle("install:start", async (_, config: InstallConfig) => {
    try {
      // Step 1 — Install OpenClaw globally
      emit(win, "install:progress", {
        percent: 5,
        message: config.language === "es"
          ? "Descargando OpenClaw..."
          : "Downloading OpenClaw...",
      } satisfies InstallProgressEvent);

      await runCommand(
        win,
        "npm",
        ["install", "-g", "openclaw@latest", "--no-fund", "--no-audit"],
        10,
        35,
        config.language === "es" ? "Instalando OpenClaw..." : "Installing OpenClaw..."
      );

      // Step 2 — Write config file via openclaw config set
      emit(win, "install:progress", {
        percent: 40,
        message: config.language === "es"
          ? "Aplicando configuración..."
          : "Applying configuration...",
      } satisfies InstallProgressEvent);

      const envPairs: [string, string][] = [
        ["AGENT_NAME", config.agentName],
        ["PRIMARY_MODEL", config.primaryModel],
        ...(config.fallbackModel ? [["FALLBACK_MODEL", config.fallbackModel] as [string, string]] : []),
        ...(config.apiKey ? [["LLM_API_KEY", config.apiKey] as [string, string]] : []),
        ...(config.phoneNumber ? [["WHATSAPP_NUMBER", config.phoneNumber] as [string, string]] : []),
        ...(config.telegramToken ? [["TELEGRAM_BOT_TOKEN", config.telegramToken] as [string, string]] : []),
        ...(config.discordToken ? [["DISCORD_BOT_TOKEN", config.discordToken] as [string, string]] : []),
      ];

      for (const [key, value] of envPairs) {
        await runCommand(
          win,
          "openclaw",
          ["config", "set", key, value],
          40,
          55,
          config.language === "es"
            ? "Configurando credenciales..."
            : "Setting credentials..."
        );
      }

      // Step 3 — Start openclaw service
      emit(win, "install:progress", {
        percent: 65,
        message: config.language === "es"
          ? "Iniciando servicio..."
          : "Starting service...",
      } satisfies InstallProgressEvent);

      await runCommand(
        win,
        "openclaw",
        ["start", "--no-browser"],
        65,
        90,
        config.language === "es" ? "Iniciando OpenClaw..." : "Starting OpenClaw..."
      );

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
