import { app, shell, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerSystemHandlers } from "./handlers/system.handler";
import { registerInstallHandlers } from "./handlers/install.handler";
import { registerConfigHandlers } from "./handlers/config.handler";
import { registerUpdateHandlers, configureAutoUpdater } from "./handlers/update.handler";
import { registerSessionHandlers, cleanupOldSessions } from "./handlers/session.handler";
import { registerNetworkHandlers, startNetworkMonitoring } from "./handlers/network.handler";
import { registerControlHandlers, startControlMonitoring } from "./handlers/control.handler";
import { registerRepairHandlers } from "./handlers/repair.handler";
import { registerExportHandlers } from "./handlers/export.handler";
import { registerStateHandlers } from "./handlers/state.handler";
import { registerDiagnosticHandlers } from "./handlers/diagnostic.handler";
import { registerAutostartHandlers } from "./handlers/autostart.handler";
import { registerWslHandlers } from "./handlers/wsl.handler";
import { registerDepsHandlers } from "./handlers/deps.handler";
import { startHealthcheckLoop, stopHealthcheckLoop } from "./healthcheck";
import { closeDb } from "./db";

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 620,
    minWidth: 760,
    minHeight: 560,
    show: false,
    resizable: true,
    frame: false,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#0f0f0f",
    icon: path.join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow!.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.openclaw.easy-installer");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Register all IPC handlers
  registerSystemHandlers();
  registerInstallHandlers(mainWindow);
  registerConfigHandlers();
  registerUpdateHandlers();
  registerSessionHandlers();
  registerNetworkHandlers();
  registerControlHandlers();
  registerRepairHandlers();
  registerExportHandlers();
  registerStateHandlers();
  registerDiagnosticHandlers();
  registerAutostartHandlers();
  registerWslHandlers();
  registerDepsHandlers();

  createWindow();

  // Start healthcheck loop after window is created
  startHealthcheckLoop(mainWindow);

  // Configure auto-updater after window is ready
  configureAutoUpdater();

  // Start network monitoring
  startNetworkMonitoring(mainWindow);
  
  // Start control monitoring
  startControlMonitoring(mainWindow);

  // Cleanup old sessions (30+ days)
  cleanupOldSessions();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  stopHealthcheckLoop();
  closeDb();
});

// Handle window controls via IPC
ipcMain.on("window:minimize", () => mainWindow?.minimize());
ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window:close", () => mainWindow?.close());
