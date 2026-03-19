import Database from "better-sqlite3";
import { join } from "node:path";
import { homedir } from "node:os";
import { mkdirSync } from "node:fs";

const DB_DIR = join(homedir(), ".openclaw");
const DB_PATH = join(DB_DIR, "data.db");

let db: Database.Database | null = null;

/**
 * Gets (or creates) the singleton SQLite database connection.
 * Creates the ~/.openclaw directory and all required tables if they don't exist.
 */
export function getDb(): Database.Database {
  if (db) return db;

  // Ensure the directory exists
  mkdirSync(DB_DIR, { recursive: true });

  db = new Database(DB_PATH);

  // Enable WAL mode for better write performance and crash safety
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      action     TEXT NOT NULL,
      detail     TEXT,
      result     TEXT,
      timestamp  DATETIME DEFAULT (datetime('now'))
    );
  `);

  return db;
}

/**
 * Reads a state value by key. Returns null if not found.
 */
export function getState(key: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT value FROM app_state WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

/**
 * Writes a state value. Inserts or updates the key.
 */
export function setState(key: string, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO app_state (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value);
}

/**
 * Logs a user-triggered or system action to the audit_log table.
 */
export function logAction(action: string, detail?: string, result?: string): void {
  try {
    const db = getDb();
    db.prepare("INSERT INTO audit_log (action, detail, result) VALUES (?, ?, ?)").run(action, detail ?? null, result ?? null);
  } catch (err) {
    console.error("Failed to write to audit_log:", err);
  }
}

/**
 * Returns the last N audit log entries (newest first).
 */
export function getAuditLog(limit = 50): Array<{ id: number; action: string; detail: string | null; result: string | null; timestamp: string }> {
  const db = getDb();
  return db.prepare("SELECT id, action, detail, result, timestamp FROM audit_log ORDER BY id DESC LIMIT ?").all(limit) as Array<{ id: number; action: string; detail: string | null; result: string | null; timestamp: string }>;
}

/**
 * Closes the database connection (called on app quit).
 */
export function closeDb(): void {
  db?.close();
  db = null;
}
