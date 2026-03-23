import { ipcMain } from "electron";
import { saveSecret, getSecret, deleteSecret } from "../keychain";

export function registerKeychainHandlers(): void {
  ipcMain.handle("keychain:save", async (_, key: string, value: string) => {
    return saveSecret(key, value);
  });

  ipcMain.handle("keychain:get", async (_, key: string) => {
    return getSecret(key);
  });

  ipcMain.handle("keychain:delete", async (_, key: string) => {
    return deleteSecret(key);
  });
}
