import { ipcMain } from "electron";
import { execSync } from "node:child_process";
import net from "node:net";
import os from "node:os";


export interface SystemCheckResult {
  nodeInstalled: boolean;
  nodeVersion: string | null;
  nodeMeetsRequirement: boolean;
  portAvailable: boolean;
  diskSpaceGB: number;
  diskSpaceMeetsRequirement: boolean;
  gitInstalled: boolean;
  platform: NodeJS.Platform;
  arch: string;
}

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
    return 100; // assume enough if can't check
  }
}

function isGitInstalled(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function registerSystemHandlers(): void {
  ipcMain.handle("system:check", async (): Promise<SystemCheckResult> => {
    const node = getNodeVersion();
    const [portAvailable] = await Promise.all([checkPort(18789)]);
    const diskSpaceGB = getDiskSpaceGB();

    return {
      nodeInstalled: node.installed,
      nodeVersion: node.version,
      nodeMeetsRequirement: node.meetsRequirement,
      portAvailable,
      diskSpaceGB,
      diskSpaceMeetsRequirement: diskSpaceGB >= 5,
      gitInstalled: isGitInstalled(),
      platform: process.platform,
      arch: process.arch,
    };
  });

  ipcMain.handle("system:open-url", async (_, url: string) => {
    const { shell } = await import("electron");
    shell.openExternal(url);
  });
}
