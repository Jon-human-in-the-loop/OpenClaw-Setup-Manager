import { contextBridge, ipcRenderer } from "electron";
import type {
  InstallConfig,
  SystemCheckResult,
  InstallProgressEvent,
  InstallCompleteEvent,
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
} as const;

contextBridge.exposeInMainWorld("api", api);

export type Api = typeof api;
