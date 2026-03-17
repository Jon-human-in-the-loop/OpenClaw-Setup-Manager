import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useNetwork } from "../context/NetworkContext";

export function ConnectionStatus() {
  const { isOnline, isChecking, manualCheck } = useNetwork();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-red-900/30 border-b border-red-800 px-4 py-2 flex items-center gap-3"
        >
          <WifiOff className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">Offline mode</span>

          <button
            onClick={manualCheck}
            disabled={isChecking}
            className="ml-auto text-xs text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            {isChecking ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-3 h-3" />
                </motion.div>
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                Retry
              </>
            )}
          </button>
        </motion.div>
      )}

      {isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-900/20 border-b border-green-800/30 px-4 py-1.5 flex items-center gap-2"
        >
          <Wifi className="w-3 h-3 text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-300">Online</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
