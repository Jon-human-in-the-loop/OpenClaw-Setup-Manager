import { execSync } from "node:child_process";
import { platform, homedir } from "node:os";
import { join } from "node:path";

export function isWindows(): boolean {
  return platform() === "win32";
}

export type WslStatus = "not-installed" | "no-distro" | "ready";

export interface WslDetailedStatus {
  status: WslStatus;
  defaultDistro?: string;
  linuxHome?: string;
}

/** Simple in-process cache to avoid repeated WSL queries */
let _wslCache: WslDetailedStatus | null = null;

export function clearWslCache(): void {
  _wslCache = null;
}

/**
 * Returns the detailed WSL state:
 * - "not-installed": WSL feature not enabled on this Windows machine
 * - "no-distro":     WSL installed but no Linux distributions present
 * - "ready":         WSL installed with at least one usable distro
 *
 * On macOS / Linux always returns { status: "ready" }.
 */
export function getWslDetailedStatus(useCache = true): WslDetailedStatus {
  if (!isWindows()) {
    return { status: "ready" };
  }

  if (useCache && _wslCache) {
    return _wslCache;
  }

  // Try listing distros — this fails when WSL itself is not installed.
  let distros: string[] = [];
  let wslAvailable = false;

  try {
    // WSL outputs UTF-16LE on Windows; read as raw Buffer to decode manually.
    const raw = execSync("wsl --list --quiet", {
      encoding: "buffer",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 8000,
    });
    wslAvailable = true;
    const decoded = raw.toString("utf16le");
    distros = decoded
      .split(/\r?\n/)
      .map((l) => l.replace(/\0/g, "").trim())
      .filter(Boolean);
  } catch {
    // `wsl --list` failed; try a cheaper probe
    try {
      execSync("wsl --status", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 8000,
      });
      wslAvailable = true;
    } catch {
      // WSL truly not available
    }
  }

  if (!wslAvailable) {
    const result: WslDetailedStatus = { status: "not-installed" };
    _wslCache = result;
    return result;
  }

  if (distros.length === 0) {
    const result: WslDetailedStatus = { status: "no-distro" };
    _wslCache = result;
    return result;
  }

  const defaultDistro = distros[0];

  // Get the Linux home directory of the default user inside WSL.
  let linuxHome: string | undefined;
  try {
    linuxHome = execSync(`wsl -e sh -c "echo $HOME"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 8000,
    }).trim();
  } catch {
    try {
      const user = execSync("wsl -e whoami", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 5000,
      }).trim();
      if (user && user !== "root") {
        linuxHome = `/home/${user}`;
      } else {
        linuxHome = "/root";
      }
    } catch {
      linuxHome = undefined;
    }
  }

  const result: WslDetailedStatus = { status: "ready", defaultDistro, linuxHome };
  _wslCache = result;
  return result;
}

// ─── Path helpers ────────────────────────────────────────────

/**
 * Returns the .openclaw config directory as a path suitable for Node.js
 * file-system operations:
 * - Windows: UNC path  \\wsl$\<Distro>\home\<user>\.openclaw
 * - macOS/Linux: ~/.openclaw
 */
export function getOpenClawDir(): string {
  if (!isWindows()) {
    return join(homedir(), ".openclaw");
  }

  const wsl = getWslDetailedStatus();
  if (wsl.status !== "ready" || !wsl.defaultDistro || !wsl.linuxHome) {
    // Fallback — should not be reached after the wsl-setup wizard step.
    return join(homedir(), ".openclaw");
  }

  // Convert Linux path /home/ubuntu → Windows UNC \\wsl$\Ubuntu\home\ubuntu
  const linuxRelative = wsl.linuxHome.replace(/^\//, "");
  const winRelative = linuxRelative.split("/").join("\\");
  return `\\\\wsl$\\${wsl.defaultDistro}\\${winRelative}\\.openclaw`;
}

/**
 * Returns the .openclaw config directory as a Linux-style path for use
 * inside WSL commands (docker compose -f, etc.):
 * - Windows: /home/<user>/.openclaw
 * - macOS/Linux: ~/.openclaw (same as getOpenClawDir)
 */
export function getOpenClawLinuxDir(): string {
  if (!isWindows()) {
    return join(homedir(), ".openclaw");
  }

  const wsl = getWslDetailedStatus();
  if (wsl.status !== "ready" || !wsl.linuxHome) {
    return "~/.openclaw";
  }

  return `${wsl.linuxHome}/.openclaw`;
}

// ─── Docker command wrappers ─────────────────────────────────

/**
 * Wraps a docker command string so it runs inside WSL on Windows.
 *
 * Usage: execSync(wrapDockerCmd(`stop ${containerId}`), opts)
 */
export function wrapDockerCmd(rest: string): string {
  return isWindows() ? `wsl -e docker ${rest}` : `docker ${rest}`;
}

/**
 * Returns spawn-compatible { command, args } for a plain docker invocation.
 */
export function spawnDockerArgs(dockerArgs: string[]): { command: string; args: string[] } {
  if (isWindows()) {
    return { command: "wsl", args: ["-e", "docker", ...dockerArgs] };
  }
  return { command: "docker", args: dockerArgs };
}

/**
 * Returns spawn-compatible { command, args } for a `docker compose` invocation.
 *
 * @param composePath  Linux-style path to docker-compose.yml (on Windows this
 *                     must be the in-WSL path, e.g. /home/ubuntu/.openclaw/docker-compose.yml)
 * @param subArgs      Subcommand args, e.g. ["up", "-d"] or ["pull"]
 */
export function spawnDockerComposeArgs(
  composePath: string,
  subArgs: string[]
): { command: string; args: string[] } {
  if (isWindows()) {
    return {
      command: "wsl",
      args: ["-e", "docker", "compose", "-f", composePath, ...subArgs],
    };
  }
  return { command: "docker", args: ["compose", "-f", composePath, ...subArgs] };
}

/**
 * Returns an env-var supplement that forwards specific keys into WSL via WSLENV.
 * On non-Windows this returns an empty object (no-op).
 *
 * Usage:
 *   const env = { ...process.env, LLM_API_KEY: "...", ...wslForwardEnv(["LLM_API_KEY"]) };
 *   execSync(wrapDockerCmd("..."), { env });
 */
export function wslForwardEnv(keys: string[]): Record<string, string> {
  if (!isWindows()) return {};
  return { WSLENV: keys.join(":") };
}
