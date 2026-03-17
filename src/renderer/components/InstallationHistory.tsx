import { motion } from "framer-motion";
import { Trash2, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { InstallationSession } from "../../types";

interface InstallationHistoryProps {
  onClose: () => void;
  onResume: (session: InstallationSession) => void;
}

export function InstallationHistory({ onClose, onResume }: InstallationHistoryProps) {
  const [sessions, setSessions] = useState<InstallationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const history = await window.api.session.list();
      setSessions(history.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await window.api.session.delete(sessionId);
      setSessions(sessions.filter((s) => s.sessionId !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      case "active":
        return "text-yellow-400 bg-yellow-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg shadow-2xl max-w-2xl max-h-[80vh] flex flex-col border border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Installation History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No installation history yet
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">
                          {session.agentName || "Unnamed Agent"}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Model: {session.primaryModel} • Channels: {session.channels.length} •{" "}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {session.status === "active" && (
                        <button
                          onClick={() => onResume(session)}
                          className="text-blue-400 hover:text-blue-300 transition p-1"
                          title="Resume"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(session.sessionId)}
                        className="text-red-400 hover:text-red-300 transition p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
