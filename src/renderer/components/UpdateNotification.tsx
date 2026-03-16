import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdate } from "../context/UpdateContext";
import { Download, X } from "lucide-react";

export function UpdateNotification() {
  const { available, updateInfo, state, downloadUpdate, dismissUpdate } = useUpdate();

  if (!available || !updateInfo) {
    return null;
  }

  const isDownloading = state === "downloading";
  const isDownloaded = state === "downloaded";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-4 max-w-sm z-50"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Download className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-xs text-blue-100 mt-1">
              Version {updateInfo.version} is ready to install
            </p>
            {updateInfo.releaseNotes && (
              <p className="text-xs text-blue-100 mt-2 line-clamp-2">
                {updateInfo.releaseNotes}
              </p>
            )}

            <div className="flex gap-2 mt-3">
              {!isDownloaded ? (
                <button
                  onClick={downloadUpdate}
                  disabled={isDownloading}
                  className="text-xs bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isDownloading ? "Downloading..." : "Download"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    // The UpdateContext will handle the restart
                    // For now, just indicate update is ready
                  }}
                  className="text-xs bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-50 transition"
                >
                  Install & Restart
                </button>
              )}

              <button
                onClick={dismissUpdate}
                disabled={isDownloading}
                className="text-xs text-blue-100 px-3 py-1 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={dismissUpdate}
            disabled={isDownloading}
            className="text-blue-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
