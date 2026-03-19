import { ipcMain } from "electron";
import { join } from "node:path";
import { homedir } from "node:os";
import { promises as fs } from "node:fs";
import type { OpenClawState } from "../../types";

const STATE_FILE_DIR = join(homedir(), ".openclaw");
const STATE_FILE_PATH = join(STATE_FILE_DIR, "state.json");

const DEFAULT_STATE: OpenClawState = {
  installed: false,
  lastHealthCheck: "unknown",
  version: "latest",
};

/**
 * Ensures the directory exists before writing.
 */
async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(STATE_FILE_DIR, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Reads the state from ~/.openclaw/state.json.
 * If it doesn't exist, returns the DEFAULT_STATE.
 */
export async function readState(): Promise<OpenClawState> {
  try {
    const data = await fs.readFile(STATE_FILE_PATH, "utf-8");
    return JSON.parse(data) as OpenClawState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return DEFAULT_STATE;
    }
    console.error("Failed to read OpenClaw state.json:", error);
    return DEFAULT_STATE; // Fallback to safe defaults if corruption happens
  }
}

/**
 * Writes the full state object to ~/.openclaw/state.json.
 */
export async function writeState(state: OpenClawState): Promise<boolean> {
  try {
    await ensureDir();
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write OpenClaw state.json:", error);
    return false;
  }
}

/**
 * Merges partial state updates into the existing state.
 */
export async function updateState(partialState: Partial<OpenClawState>): Promise<OpenClawState> {
  const currentState = await readState();
  const newState = { ...currentState, ...partialState };
  await writeState(newState);
  return newState;
}

export function registerStateHandlers(): void {
  ipcMain.handle("state:read", async () => {
    return await readState();
  });

  ipcMain.handle("state:write", async (_, partialState: Partial<OpenClawState>) => {
    return await updateState(partialState);
  });
}
