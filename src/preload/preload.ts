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
  NetworkStatus,
  ContainerStatus,
  ControlActionResult,
  RepairIssue,
  RepairResult,
  OpenClawState,
  HealthStatus,
} from "../types";

// Expose a safe, typed API to the renderer via window.api
const api = {
  // System checks
  system: {
    check: () => ipcRenderer.invoke("system:check"),
    openUrl: (url: string) => ipcRenderer.invoke("system:open-url", url),
    reboot: () => ipcRenderer.invoke("system:reboot"),
    installDocker: () => ipcRenderer.invoke("system:install-docker"),
    installOllama: () => ipcRenderer.invoke("system:install-ollama"),
    onHealthUpdate: (callback: (status: HealthStatus) => void) => {
      ipcRenderer.on("system:health-update", (_, data) => callback(data));
    },
    removeHealthListener: () => {
      ipcRenderer.removeAllListeners("system:health-update");
    },
  },
  wsl: {
    install: (distro: string) => ipcRenderer.invoke("wsl:install", distro),
  },
  deps: {
    install: (depId: string) => ipcRenderer.invoke("deps:install", depId),
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

  // Secure OS Keychain Memory
  keychain: {
    save: (key: string, value: string): Promise<boolean> =>
      ipcRenderer.invoke("keychain:save", key, value),
    get: (key: string): Promise<string | null> =>
      ipcRenderer.invoke("keychain:get", key),
    delete: (key: string): Promise<boolean> =>
      ipcRenderer.invoke("keychain:delete", key),
  },

  // Window controls (for frameless window)
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
  },

  // Auto-update (App & Container)
  update: {
    check: (): Promise<UpdateCheckResult> =>
      ipcRenderer.invoke("update:check"),
    download: (): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("update:download"),
    install: (): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("update:install"),
    getVersion: (): Promise<{ version: string }> =>
      ipcRenderer.invoke("app:version"),
    getAvailableVersions: (): Promise<{ success: boolean; tags: string[] }> =>
      ipcRenderer.invoke("update:get-available-versions"),
    getCurrentVersion: (): Promise<{ success: boolean; version: string | null }> =>
      ipcRenderer.invoke("update:get-current-version"),
    applyVersion: (newTag: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke("update:apply-version", newTag),
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

  // Network status (offline mode)
  network: {
    getStatus: (): Promise<NetworkStatus> =>
      ipcRenderer.invoke("network:status"),
    check: (): Promise<NetworkStatus> =>
      ipcRenderer.invoke("network:check"),
    onStatusChanged: (callback: (status: NetworkStatus) => void) => {
      ipcRenderer.on("network:status-changed", (_, data) => callback(data));
    },
    removeListener: () => {
      ipcRenderer.removeAllListeners("network:status-changed");
    },
  },

  // Control Center (post-installation)
  control: {
    status: (): Promise<ContainerStatus> =>
      ipcRenderer.invoke("control:status"),
    start: (): Promise<ControlActionResult> =>
      ipcRenderer.invoke("control:start"),
    stop: (): Promise<ControlActionResult> =>
      ipcRenderer.invoke("control:stop"),
    restart: (): Promise<ControlActionResult> =>
      ipcRenderer.invoke("control:restart"),
    logs: (limit?: number): Promise<ControlActionResult> =>
      ipcRenderer.invoke("control:logs", limit),
    containerLogs: (limit?: number) =>
      ipcRenderer.invoke("control:container-logs", limit),
    openDashboard: (): Promise<ControlActionResult> =>
      ipcRenderer.invoke("control:open-dashboard"),
    openConfig: (): Promise<ControlActionResult> =>
      ipcRenderer.invoke("control:open-config"),
    onStatusChanged: (callback: (status: ContainerStatus) => void) => {
      ipcRenderer.on("control:status-changed", (_, data) => callback(data));
    },
    removeStatusListener: () => {
      ipcRenderer.removeAllListeners("control:status-changed");
    },
  },

  // Export Engine
  exportUtils: {
    script: (): Promise<{ success: boolean; filePath?: string; error?: string }> =>
      ipcRenderer.invoke("export:script"),
  },

  // Repair engine
  repair: {
    diagnose: (): Promise<RepairIssue[]> =>
      ipcRenderer.invoke("repair:diagnose"),
    fix: (issueId: string): Promise<RepairResult> =>
      ipcRenderer.invoke("repair:fix", issueId),
    fixAll: (): Promise<RepairResult[]> =>
      ipcRenderer.invoke("repair:fix-all"),
  },

  // Diagnostics Export
  diagnostic: {
    export: (): Promise<ControlActionResult> =>
      ipcRenderer.invoke("diagnostic:export"),
  },

  // State engine (Persistent Memoria)
  state: {
    read: (): Promise<OpenClawState> => ipcRenderer.invoke("state:read"),
    write: (partialState: Partial<OpenClawState>): Promise<{ success: boolean }> =>
      ipcRenderer.invoke("state:write", partialState),
    getAuditLog: (limit?: number) => ipcRenderer.invoke("state:audit-log", limit),
  },

  // Autostart (Epic 5)
  autostart: {
    getStatus: (): Promise<boolean> => ipcRenderer.invoke("autostart:get-status"),
    toggle: (enable: boolean): Promise<{ success: boolean; enabled?: boolean; error?: string }> =>
      ipcRenderer.invoke("autostart:toggle", enable),
  },

  // Backup & Restore (V3)
  backup: {
    export: (password: string): Promise<{ success: boolean; message: string; filePath?: string }> =>
      ipcRenderer.invoke("backup:export", password),
    import: (password: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke("backup:import", password),
  },

  // User Profiles (V3)
  profile: {
    list: (): Promise<{ success: boolean; profiles?: { id: number; username: string; created_at: string }[] }> =>
      ipcRenderer.invoke("profile:list"),
    create: (username: string, pin: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke("profile:create", username, pin),
    login: (username: string, pin: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke("profile:login", username, pin),
    delete: (username: string, pin: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke("profile:delete", username, pin),
  },
} as const;

contextBridge.exposeInMainWorld("api", api);

export type Api = typeof api;
