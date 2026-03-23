import { safeStorage } from "electron";
import { getState, setState } from "./db";

/**
 * Stores an encrypted secret in the SQLite database.
 * The encryption uses the OS's native key management mechanism (safeStorage).
 */
export function saveSecret(key: string, value: string): boolean {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn("safeStorage encryption is not available. Saving as plain text.");
      setState(`secret_${key}`, value);
      return true;
    }

    const encryptedBuffer = safeStorage.encryptString(value);
    // Store as base64 string in DB
    setState(`secret_${key}`, encryptedBuffer.toString("base64"));
    return true;
  } catch (error) {
    console.error(`Failed to save secret for key: ${key}`, error);
    return false;
  }
}

/**
 * Retrieves and decrypts a secret from the SQLite database.
 */
export function getSecret(key: string): string | null {
  try {
    const stored = getState(`secret_${key}`);
    if (!stored) return null;

    if (!safeStorage.isEncryptionAvailable()) {
      return stored; // Fallback plain text
    }

    const encryptedBuffer = Buffer.from(stored, "base64");
    return safeStorage.decryptString(encryptedBuffer);
  } catch (error) {
    console.error(`Failed to retrieve secret for key: ${key}`, error);
    return null;
  }
}

/**
 * Removes a secret from the SQLite database.
 */
export function deleteSecret(key: string): boolean {
  try {
    // We just write a null/empty value or delete the key.
    // getState/setState uses REPLACE, so we can set it to empty string or handle deletion.
    setState(`secret_${key}`, "");
    return true;
  } catch (error) {
    console.error(`Failed to delete secret for key: ${key}`, error);
    return false;
  }
}
