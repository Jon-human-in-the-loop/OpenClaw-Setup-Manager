import { motion } from "framer-motion";
import { RotateCcw, Play, Eye } from "lucide-react";
import type { InstallationSession } from "../../types";

interface ResumeModalProps {
  session: InstallationSession;
  onResume: (session: InstallationSession) => void;
  onStartFresh: () => void;
  onViewHistory: () => void;
}

export function ResumeModal({ session, onResume, onStartFresh, onViewHistory }: ResumeModalProps) {
  const sessionDate = new Date(session.lastModifiedAt);
  const lastSavedText = sessionDate.toLocaleDateString() + " " + sessionDate.toLocaleTimeString();

  // Map step to readable name
  const stepNames: Record<string, string> = {
    welcome: "Welcome",
    "system-check": "System Check",
    "setup-type": "Setup Type",
    "agent-name": "Agent Name",
    model: "Model Selection",
    "api-key": "API Key",
    channels: "Channels",
    credentials: "Credentials",
    installing: "Installation",
    success: "Success",
  };

  const currentStepName = stepNames[session.currentStep] || session.currentStep;

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
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg shadow-2xl p-8 max-w-md border border-gray-700"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Resume Installation?</h2>
          <p className="text-sm text-gray-400">
            We found an incomplete installation from {lastSavedText}
          </p>
        </div>

        {/* Session Summary */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Agent:</span>
              <span className="text-white font-medium">{session.agentName || "(not set)"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Model:</span>
              <span className="text-white font-medium">{session.primaryModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Step:</span>
              <span className="text-blue-400 font-medium">{currentStepName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Channels:</span>
              <span className="text-white font-medium">{session.channels.length} selected</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Resume Button */}
          <button
            onClick={() => onResume(session)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105"
          >
            <Play className="w-4 h-4" />
            Resume from {currentStepName}
          </button>

          {/* Start Fresh Button */}
          <button
            onClick={onStartFresh}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Start Fresh
          </button>

          {/* View History Button */}
          <button
            onClick={onViewHistory}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition border border-gray-600"
          >
            <Eye className="w-4 h-4" />
            View Installation History
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Your configuration and progress will be restored
        </p>
      </motion.div>
    </motion.div>
  );
}
