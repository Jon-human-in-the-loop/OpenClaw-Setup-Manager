import React from "react";
import { motion } from "framer-motion";
import { useUpdate } from "../context/UpdateContext";
import { AlertCircle } from "lucide-react";

export function UpdateProgress() {
  const { state, progress, error, resetError } = useUpdate();

  if (state === "idle" || state === "checking" || state === "available") {
    return null;
  }

  if (state === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Update Failed</h2>
          </div>

          <p className="text-sm text-gray-300 mb-4">{error || "An error occurred during the update process"}</p>

          <button
            onClick={resetError}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm">
        <h2 className="text-lg font-semibold text-white mb-4">
          {state === "downloading" ? "Downloading Update" : "Installing Update"}
        </h2>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          {state === "downloading" ? "Downloading update files..." : "Installing and preparing to restart..."}
        </p>
      </div>
    </motion.div>
  );
}
