import { ipcMain } from "electron";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "../db";

// ─── Crypto helpers ──────────────────────────────────────────

const PBKDF2_ITERATIONS = 150_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

function hashPin(pin: string, salt: Buffer): string {
  const hash = pbkdf2Sync(pin, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  return hash.toString("hex");
}

function verifyPin(pin: string, saltHex: string, storedHashHex: string): boolean {
  const salt = Buffer.from(saltHex, "hex");
  const incoming = Buffer.from(hashPin(pin, salt), "hex");
  const stored = Buffer.from(storedHashHex, "hex");
  // Constant-time comparison to prevent timing attacks
  if (incoming.length !== stored.length) return false;
  return timingSafeEqual(incoming, stored);
}

// ─── Types ───────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  username: string;
  created_at: string;
}

interface ProfileResult {
  success: boolean;
  message: string;
  profile?: UserProfile;
  profiles?: UserProfile[];
}

// ─── IPC Registration ────────────────────────────────────────

export function registerProfileHandlers(): void {
  /**
   * profile:list — Returns all profiles (without hashes).
   */
  ipcMain.handle("profile:list", async (): Promise<ProfileResult> => {
    try {
      const db = getDb();
      const profiles = db
        .prepare("SELECT id, username, created_at FROM users ORDER BY id ASC")
        .all() as UserProfile[];
      return { success: true, message: "OK", profiles };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Error", profiles: [] };
    }
  });

  /**
   * profile:create — Creates a new profile protected by a PIN.
   * Username must be unique.
   */
  ipcMain.handle("profile:create", async (_, username: string, pin: string): Promise<ProfileResult> => {
    if (!username || username.trim().length < 1) {
      return { success: false, message: "El nombre de usuario no puede estar vacío." };
    }
    if (!pin || pin.trim().length < 4) {
      return { success: false, message: "El PIN debe tener al menos 4 dígitos." };
    }

    try {
      const db = getDb();
      const salt = randomBytes(32);
      const pinHash = hashPin(pin, salt);

      db.prepare("INSERT INTO users (username, pin_hash, salt) VALUES (?, ?, ?)").run(
        username.trim(),
        pinHash,
        salt.toString("hex")
      );

      const profile = db
        .prepare("SELECT id, username, created_at FROM users WHERE username = ?")
        .get(username.trim()) as UserProfile;

      return { success: true, message: `Perfil "${username}" creado correctamente.`, profile };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      if (msg.includes("UNIQUE")) {
        return { success: false, message: `El nombre de usuario "${username}" ya existe.` };
      }
      return { success: false, message: msg };
    }
  });

  /**
   * profile:login — Verifies a PIN for a given username.
   * Returns the profile if correct, or a failure message.
   */
  ipcMain.handle("profile:login", async (_, username: string, pin: string): Promise<ProfileResult> => {
    try {
      const db = getDb();
      const row = db
        .prepare("SELECT id, username, pin_hash, salt, created_at FROM users WHERE username = ?")
        .get(username) as { id: number; username: string; pin_hash: string; salt: string; created_at: string } | undefined;

      if (!row) {
        return { success: false, message: "Usuario no encontrado." };
      }

      const valid = verifyPin(pin, row.salt, row.pin_hash);
      if (!valid) {
        return { success: false, message: "PIN incorrecto." };
      }

      const profile: UserProfile = { id: row.id, username: row.username, created_at: row.created_at };
      return { success: true, message: "Inicio de sesión correcto.", profile };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Error desconocido" };
    }
  });

  /**
   * profile:delete — Deletes a profile after PIN verification.
   */
  ipcMain.handle("profile:delete", async (_, username: string, pin: string): Promise<ProfileResult> => {
    try {
      const db = getDb();
      const row = db
        .prepare("SELECT pin_hash, salt FROM users WHERE username = ?")
        .get(username) as { pin_hash: string; salt: string } | undefined;

      if (!row) {
        return { success: false, message: "Usuario no encontrado." };
      }
      if (!verifyPin(pin, row.salt, row.pin_hash)) {
        return { success: false, message: "PIN incorrecto. No se puede eliminar el perfil." };
      }

      db.prepare("DELETE FROM users WHERE username = ?").run(username);
      return { success: true, message: `Perfil "${username}" eliminado.` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Error desconocido" };
    }
  });
}
