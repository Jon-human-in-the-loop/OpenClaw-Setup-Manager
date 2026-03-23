import { ipcMain, dialog, app } from "electron";
import { execSync } from "node:child_process";
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import JSZip from "jszip";

const OPENCLAW_DIR = join(homedir(), ".openclaw");
const DB_PATH = join(OPENCLAW_DIR, "data.db");

// ─── Crypto helpers ──────────────────────────────────────────

const PBKDF2_ITERATIONS = 150_000;
const PBKDF2_KEYLEN = 32; // 256-bit
const PBKDF2_DIGEST = "sha512";

function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
}

/**
 * Encrypts an arbitrary Buffer using AES-256-GCM.
 * Returns: [salt(16) | iv(12) | authTag(16) | ciphertext]
 */
function encryptBuffer(data: Buffer, password: string): Buffer {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(password, salt);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Decrypts a buffer produced by encryptBuffer().
 * Throws if password is wrong (GCM auth fails) — no silent corruption.
 */
function decryptBuffer(payload: Buffer, password: string): Buffer {
  const salt = payload.subarray(0, 16);
  const iv = payload.subarray(16, 28);
  const authTag = payload.subarray(28, 44);
  const ciphertext = payload.subarray(44);

  const key = deriveKey(password, salt);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error("Contraseña incorrecta o backup corrupto.");
  }
}

// ─── Backup / Restore ────────────────────────────────────────

async function buildZip(): Promise<Buffer> {
  const zip = new JSZip();

  // Always include the DB
  if (existsSync(DB_PATH)) {
    zip.file("data.db", readFileSync(DB_PATH));
  }

  // Include every docker-compose file
  if (existsSync(OPENCLAW_DIR)) {
    for (const file of readdirSync(OPENCLAW_DIR)) {
      if (file.startsWith("docker-compose") && file.endsWith(".yml")) {
        zip.file(file, readFileSync(join(OPENCLAW_DIR, file)));
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return zipBuffer;
}

// ─── IPC Registration ────────────────────────────────────────

export interface BackupResult {
  success: boolean;
  message: string;
  filePath?: string;
}

export function registerBackupHandlers(): void {
  /**
   * backup:export — Packages .db + compose files into a
   * password-encrypted .occlaw file the user saves to disk.
   */
  ipcMain.handle("backup:export", async (_, password: string): Promise<BackupResult> => {
    if (!password || password.trim().length < 4) {
      return { success: false, message: "La contraseña debe tener al menos 4 caracteres." };
    }

    try {
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Guardar backup de OpenClaw",
        defaultPath: join(
          app.getPath("documents"),
          `openclaw-backup-${new Date().toISOString().split("T")[0]}.occlaw`
        ),
        filters: [{ name: "OpenClaw Backup", extensions: ["occlaw"] }],
      });

      if (canceled || !filePath) {
        return { success: false, message: "Cancelado." };
      }

      const zipBuffer = await buildZip();
      const encrypted = encryptBuffer(zipBuffer, password);
      writeFileSync(filePath, encrypted);

      return {
        success: true,
        message: `Backup guardado correctamente en ${filePath}`,
        filePath,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Error desconocido al exportar.",
      };
    }
  });

  /**
   * backup:import — Decrypts a .occlaw file, stops containers,
   * restores files, and restarts the stack.
   */
  ipcMain.handle("backup:import", async (_, password: string): Promise<BackupResult> => {
    if (!password || password.trim().length < 4) {
      return { success: false, message: "La contraseña debe tener al menos 4 caracteres." };
    }

    try {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: "Seleccionar backup de OpenClaw",
        filters: [{ name: "OpenClaw Backup", extensions: ["occlaw"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) {
        return { success: false, message: "Cancelado." };
      }

      const encryptedPayload = readFileSync(filePaths[0]);

      // Decrypt — throws if password is wrong
      const zipBuffer = decryptBuffer(encryptedPayload, password);

      const zip = await JSZip.loadAsync(zipBuffer);

      mkdirSync(OPENCLAW_DIR, { recursive: true });

      // Stop any running containers before restoring
      try {
        // Best-effort: stop all openclaw containers
        execSync(`docker ps -q --filter "name=openclaw"`, { encoding: "utf8" })
          .split("\n")
          .filter(Boolean)
          .forEach((id) => execSync(`docker stop ${id.trim()}`, { timeout: 30_000 }));
      } catch {
        // Non-fatal: container might already be stopped
      }

      // Restore files from the ZIP
      for (const [fileName, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        const destPath = join(OPENCLAW_DIR, fileName);
        const content = await file.async("nodebuffer");
        writeFileSync(destPath, content);
      }

      return {
        success: true,
        message: "Backup restaurado correctamente. Reinicia la aplicación para cargar los cambios.",
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Error desconocido al importar.",
      };
    }
  });
}
