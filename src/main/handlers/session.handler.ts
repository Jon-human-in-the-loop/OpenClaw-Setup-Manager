import { ipcMain, app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import type { InstallationSession, InstallationHistory } from "../../types";

const SESSIONS_DIR = path.join(app.getPath("userData"), "sessions");
const ACTIVE_SESSION_PATH = path.join(app.getPath("userData"), "active-session.json");

// Ensure sessions directory exists
function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

// Create new session
function createSession(): InstallationSession {
  const now = Date.now();
  return {
    sessionId: randomUUID(),
    createdAt: now,
    lastModifiedAt: now,
    status: "active",
    currentStep: "welcome",
    setupType: "quick",
    language: "en",
    agentName: "",
    primaryModel: "gpt-4",
    channels: [],
    completedSteps: [],
    installationProgress: {
      percent: 0,
      currentLog: "",
      logs: [],
    },
  };
}

// Register IPC handlers
export function registerSessionHandlers(): void {
  // Create new session
  ipcMain.handle("session:create", async (): Promise<InstallationSession> => {
    try {
      ensureSessionsDir();
      const session = createSession();
      saveSession(session);
      return session;
    } catch (error) {
      console.error("Failed to create session:", error);
      throw error;
    }
  });

  // Save session to disk
  ipcMain.handle("session:save", async (_, session: InstallationSession) => {
    try {
      ensureSessionsDir();
      saveSession(session);
      // Also save as active session for quick access
      fs.writeFileSync(ACTIVE_SESSION_PATH, JSON.stringify(session, null, 2), "utf8");
      return { success: true };
    } catch (error) {
      console.error("Failed to save session:", error);
      return { success: false, error: String(error) };
    }
  });

  // Load active session
  ipcMain.handle("session:loadActive", async (): Promise<InstallationSession | null> => {
    try {
      if (!fs.existsSync(ACTIVE_SESSION_PATH)) return null;
      const data = fs.readFileSync(ACTIVE_SESSION_PATH, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load active session:", error);
      return null;
    }
  });

  // Get all sessions
  ipcMain.handle("session:list", async (): Promise<InstallationHistory> => {
    try {
      ensureSessionsDir();
      const files = fs.readdirSync(SESSIONS_DIR);
      const sessions: InstallationSession[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const data = fs.readFileSync(path.join(SESSIONS_DIR, file), "utf8");
            sessions.push(JSON.parse(data));
          } catch {
            // Skip corrupted files
          }
        }
      }

      // Sort by lastModifiedAt descending
      sessions.sort((a, b) => b.lastModifiedAt - a.lastModifiedAt);

      return {
        sessions,
        totalCount: sessions.length,
      };
    } catch (error) {
      console.error("Failed to list sessions:", error);
      return { sessions: [], totalCount: 0 };
    }
  });

  // Get session by ID
  ipcMain.handle("session:get", async (_, sessionId: string): Promise<InstallationSession | null> => {
    try {
      ensureSessionsDir();
      const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      if (!fs.existsSync(filePath)) return null;
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to get session:", error);
      return null;
    }
  });

  // Delete session
  ipcMain.handle("session:delete", async (_, sessionId: string) => {
    try {
      ensureSessionsDir();
      const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to delete session:", error);
      return { success: false, error: String(error) };
    }
  });

  // Mark session as completed
  ipcMain.handle("session:markComplete", async (_, sessionId: string) => {
    try {
      ensureSessionsDir();
      const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        const session: InstallationSession = JSON.parse(fs.readFileSync(filePath, "utf8"));
        session.status = "completed";
        session.lastModifiedAt = Date.now();
        fs.writeFileSync(filePath, JSON.stringify(session, null, 2), "utf8");

        // Clear active session
        if (fs.existsSync(ACTIVE_SESSION_PATH)) {
          fs.unlinkSync(ACTIVE_SESSION_PATH);
        }
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to mark session complete:", error);
      return { success: false, error: String(error) };
    }
  });

  // Clear active session
  ipcMain.handle("session:clearActive", async () => {
    try {
      if (fs.existsSync(ACTIVE_SESSION_PATH)) {
        fs.unlinkSync(ACTIVE_SESSION_PATH);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to clear active session:", error);
      return { success: false, error: String(error) };
    }
  });
}

// Helper: Save session to file
function saveSession(session: InstallationSession) {
  const filePath = path.join(SESSIONS_DIR, `${session.sessionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2), "utf8");
}

// Cleanup old sessions (>30 days)
export function cleanupOldSessions() {
  try {
    ensureSessionsDir();
    const files = fs.readdirSync(SESSIONS_DIR);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(SESSIONS_DIR, file);
        try {
          const session: InstallationSession = JSON.parse(fs.readFileSync(filePath, "utf8"));
          // Delete if inactive for 30 days or if failed/interrupted
          if (session.lastModifiedAt < thirtyDaysAgo || session.status === "completed") {
            fs.unlinkSync(filePath);
          }
        } catch {
          // Skip corrupted files
        }
      }
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}
