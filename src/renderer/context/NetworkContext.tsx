import React, { createContext, useContext, useEffect, useState } from "react";
import type { NetworkStatus } from "../../types";

interface NetworkContextType {
  isOnline: boolean;
  lastCheckedAt: number;
  isChecking: boolean;
  manualCheck: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState(Date.now());
  const [isChecking, setIsChecking] = useState(false);

  // Initialize network status
  useEffect(() => {
    const initNetworkStatus = async () => {
      try {
        const status = await window.api.network.getStatus();
        setIsOnline(status.isOnline);
        setLastCheckedAt(status.lastCheckedAt);
      } catch (error) {
        console.error("Failed to get network status:", error);
      }
    };

    initNetworkStatus();

    // Listen for network status changes
    window.api.network.onStatusChanged((status: NetworkStatus) => {
      setIsOnline(status.isOnline);
      setLastCheckedAt(status.lastCheckedAt);
    });

    // Cleanup
    return () => {
      window.api.network.removeListener();
    };
  }, []);

  const manualCheck = async () => {
    try {
      setIsChecking(true);
      const status = await window.api.network.check();
      setIsOnline(status.isOnline);
      setLastCheckedAt(status.lastCheckedAt);
    } catch (error) {
      console.error("Manual network check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const value: NetworkContextType = {
    isOnline,
    lastCheckedAt,
    isChecking,
    manualCheck,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}
