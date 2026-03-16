import { ipcMain } from "electron";
import { request } from "node:https";

interface NetworkStatus {
  isOnline: boolean;
  lastCheckedAt: number;
}

let networkStatus: NetworkStatus = {
  isOnline: true,
  lastCheckedAt: Date.now(),
};

// Check internet connectivity by trying to reach GitHub API
function checkConnectivity(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = request(
      {
        hostname: "api.github.com",
        port: 443,
        path: "/",
        method: "HEAD",
        timeout: 5000,
      },
      (res) => {
        resolve(res.statusCode ? res.statusCode < 500 : false);
      }
    );

    req.on("error", () => {
      resolve(false);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Register IPC handlers
export function registerNetworkHandlers(): void {
  // Get current network status
  ipcMain.handle("network:status", async (): Promise<NetworkStatus> => {
    return networkStatus;
  });

  // Check connectivity (manual check)
  ipcMain.handle("network:check", async (): Promise<NetworkStatus> => {
    try {
      const isOnline = await checkConnectivity();
      networkStatus = {
        isOnline,
        lastCheckedAt: Date.now(),
      };
      return networkStatus;
    } catch (error) {
      console.error("Network check error:", error);
      return networkStatus;
    }
  });
}

// Start periodic network checks (every 30 seconds)
export function startNetworkMonitoring(mainWindow: Electron.BrowserWindow | null) {
  setInterval(async () => {
    const wasOnline = networkStatus.isOnline;
    const isOnline = await checkConnectivity();

    if (isOnline !== wasOnline) {
      networkStatus = {
        isOnline,
        lastCheckedAt: Date.now(),
      };

      // Notify renderer about status change
      if (mainWindow) {
        mainWindow.webContents.send("network:status-changed", networkStatus);
      }

      console.log(`Network status changed: ${wasOnline ? "online" : "offline"} → ${isOnline ? "online" : "offline"}`);
    }
  }, 30000);

  // Initial check on startup
  checkConnectivity().then((isOnline) => {
    networkStatus = {
      isOnline,
      lastCheckedAt: Date.now(),
    };
  });
}

// Export current status getter for internal use
export function getNetworkStatus(): NetworkStatus {
  return networkStatus;
}
