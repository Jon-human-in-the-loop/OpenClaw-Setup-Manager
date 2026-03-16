import { contextBridge, ipcRenderer } from "electron";
import type {
  InstallConfig,
  SystemCheckResult,
  InstallProgressEvent,
  InstallCompleteEvent,
  UpdateCheckResult,
  UpdateProgressEvent,
  UpdateErrorEvent,
  UpdateInfo,
  InstallationSession,
  InstallationHistory,
} from "../types";

// Expose a safe, typed API to the renderer via window.api
const api = {
  // System checks
  system: {
    check: (): Promise<SystemCheckResult> =>
      ipcRenderer.invoke("system:check"),
    openUrl: (url: string): void => {
      ipcRenderer.send("system:open-url", url);
    },
  },

  // Installation
  install: {
    start: (config: InstallConfig): Promise<void> =>
      ipcRenderer.invoke("install:start", config),
    onProgress: (callback: (event: InstallProgressEvent) => void) => {
      ipcRenderer.on("install:progress", (_, data) => callback(data));
    },
    onComplete: (callback: (event: InstallCompleteEvent) => void) => {
      ipcRenderer.on("install:complete", (_, data) => callback(data));
    },
    removeListeners: () => {
      ipcRenderer.removeAllListeners("install:progress");
      ipcRenderer.removeAllListeners("install:complete");
    },
  },

  // Config persistence
  config: {
    save: (config: Partial<InstallConfig>) =>
      ipcRenderer.invoke("config:save", config),
    load: (): Promise<Partial<InstallConfig> | null> =>
      ipcRenderer.invoke("config:load"),
    clear: () => ipcRenderer.invoke("config:clear"),
  },

  // Window controls (for frameless window)
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
  },

  // Auto-update
  update: {
    check: (): Promise<UpdateCheckResult> =>
      ipcRenderer.invoke("update:check"),
    download: (): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("update:download"),
    install: (): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("update:install"),
    getVersion: (): Promise<{ version: string }> =>
      ipcRenderer.invoke("app:version"),
    onAvailable: (callback: (info: UpdateInfo) => void) => {
      ipcRenderer.on("update:available", (_, data) => callback(data));
    },
    onDownloaded: (callback: () => void) => {
      ipcRenderer.on("update:downloaded", () => callback());
    },
    onProgress: (callback: (progress: UpdateProgressEvent) => void) => {
      ipcRenderer.on("update:progress", (_, data) => callback(data));
    },
    onError: (callback: (error: UpdateErrorEvent) => void) => {
      ipcRenderer.on("update:error", (_, data) => callback(data));
    },
    removeListeners: () => {
      ipcRenderer.removeAllListeners("update:available");
      ipcRenderer.removeAllListeners("update:downloaded");
      ipcRenderer.removeAllListeners("update:progress");
      ipcRenderer.removeAllListeners("update:error");
    },
  },

  // Installation sessions (resume feature)
  session: {
    create: (): Promise<InstallationSession> =>
      ipcRenderer.invoke("session:create"),
    save: (session: InstallationSession): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("session:save", session),
    loadActive: (): Promise<InstallationSession | null> =>
      ipcRenderer.invoke("session:loadActive"),
    get: (sessionId: string): Promise<InstallationSession | null> =>
      ipcRenderer.invoke("session:get", sessionId),
    list: (): Promise<InstallationHistory> =>
      ipcRenderer.invoke("session:list"),
    delete: (sessionId: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("session:delete", sessionId),
    markComplete: (sessionId: string, config: unknown): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("session:markComplete", sessionId, config),
    clearActive: (): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("session:clearActive"),
  },
} as const;

contextBridge.exposeInMainWorld("api", api);

export type Api = typeof api;
