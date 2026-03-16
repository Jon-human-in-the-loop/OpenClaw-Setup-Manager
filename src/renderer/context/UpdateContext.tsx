import React, { createContext, useContext, useEffect, useState } from "react";
import type { UpdateState, UpdateInfo, UpdateProgressEvent } from "../../types";

interface UpdateContextType {
  // State
  state: UpdateState;
  available: boolean;
  updateInfo: UpdateInfo | null;
  progress: number;
  error: string | null;
  currentVersion: string;

  // Actions
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  resetError: () => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UpdateState>("idle");
  const [available, setAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState("0.0.0");

  // Initialize and setup listeners
  useEffect(() => {
    // Get current app version
    window.api.update.getVersion().then((result) => {
      setCurrentVersion(result.version);
    });

    // Setup event listeners
    window.api.update.onAvailable((info) => {
      setUpdateInfo(info);
      setAvailable(true);
      setState("available");
    });

    window.api.update.onDownloaded(() => {
      setState("downloaded");
    });

    window.api.update.onProgress((progressData: UpdateProgressEvent) => {
      setProgress(progressData.percent);
    });

    window.api.update.onError((errorData) => {
      setError(errorData.error);
      setState("error");
    });

    // Check for updates on mount
    checkForUpdates();

    // Cleanup listeners on unmount
    return () => {
      window.api.update.removeListeners();
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      setState("checking");
      setError(null);
      const result = await window.api.update.check();
      if (result.updateAvailable && result.updateInfo) {
        setUpdateInfo(result.updateInfo);
        setAvailable(true);
        setState("available");
      } else {
        setState("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  };

  const downloadUpdate = async () => {
    try {
      setState("downloading");
      setError(null);
      setProgress(0);
      await window.api.update.download();
      // Progress events will update the progress state via onProgress listener
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
      setState("error");
    }
  };

  const installUpdate = async () => {
    try {
      setState("installing");
      setError(null);
      await window.api.update.install();
      // App will restart after install
    } catch (err) {
      setError(err instanceof Error ? err.message : "Installation failed");
      setState("error");
    }
  };

  const dismissUpdate = () => {
    setAvailable(false);
    setUpdateInfo(null);
    setState("idle");
  };

  const resetError = () => {
    setError(null);
    setState("idle");
  };

  const value: UpdateContextType = {
    state,
    available,
    updateInfo,
    progress,
    error,
    currentVersion,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    dismissUpdate,
    resetError,
  };

  return <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>;
}

export function useUpdate(): UpdateContextType {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error("useUpdate must be used within UpdateProvider");
  }
  return context;
}
