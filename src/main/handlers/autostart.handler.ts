import { ipcMain, app } from "electron";
import { resolve } from "node:path";

// In development, app.getPath("exe") points to the electron binary, which might not be what you want to auto-start.
// But we assume auto-start is mainly for production builds where app.isPackaged is true.
export function registerAutostartHandlers(): void {
  
  /**
   * autostart:get-status
   * Devuelve si la aplicación está configurada para arrancar con el SO.
   */
  ipcMain.handle("autostart:get-status", () => {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  });

  /**
   * autostart:toggle
   * Cambia el estado de auto-arranque.
   */
  ipcMain.handle("autostart:toggle", (_, enable: boolean) => {
    try {
      app.setLoginItemSettings({
        openAtLogin: enable,
        path: app.getPath("exe"), // The executable to launch
        // args: [
        //   '--processStart', `"${app.getName()}"`,
        //   '--process-start-args', `"--hidden"`
        // ]
        // Si quisiéramos arrancar oculto, podríamos pasar argumentos, pero para V2 es suficiente con arrancar normalmente o minimizado al tray. (Tray es Phase 3, así que arranca normal por ahora).
      });

      // Verify
      const settings = app.getLoginItemSettings();
      return { success: true, enabled: settings.openAtLogin };
    } catch (err) {
      console.error("Autostart toggle failed:", err);
      return { success: false, error: String(err) };
    }
  });
}
