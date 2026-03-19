import { ipcMain } from "electron";
import { getState, setState, getAuditLog } from "../db";
import type { OpenClawState } from "../../types";

const STATE_KEYS: (keyof OpenClawState)[] = ["installed", "lastHealthCheck", "version"];

const DEFAULT_STATE: OpenClawState = {
  installed: false,
  lastHealthCheck: "unknown",
  version: "latest",
};

/**
 * Reads the full OpenClawState from SQLite.
 * Each key is a separate row in `app_state`.
 * Falls back to defaults for any key that doesn't exist yet.
 */
export async function readState(): Promise<OpenClawState> {
  const result = { ...DEFAULT_STATE };

  for (const key of STATE_KEYS) {
    const raw = getState(key);
    if (raw !== null) {
      try {
        // stored as JSON so booleans/strings work correctly
        (result as Record<string, unknown>)[key] = JSON.parse(raw);
      } catch {
        (result as Record<string, unknown>)[key] = raw;
      }
    }
  }

  return result;
}

/**
 * Writes the full state object to SQLite.
 * Each field in OpenClawState becomes a separate row in `app_state`.
 */
export async function writeState(state: OpenClawState): Promise<boolean> {
  try {
    for (const key of STATE_KEYS) {
      const value = (state as Record<string, unknown>)[key];
      if (value !== undefined) {
        setState(key, JSON.stringify(value));
      }
    }
    return true;
  } catch (error) {
    console.error("Failed to write OpenClaw state to SQLite:", error);
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

  // Expose audit log to the renderer (for diagnostic export)
  ipcMain.handle("state:audit-log", async (_, limit = 50) => {
    return getAuditLog(limit);
  });
}
