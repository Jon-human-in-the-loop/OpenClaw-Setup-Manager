import { useEffect, useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { InstallationProvider, useInstallation } from "./context/InstallationContext";
import { UpdateProvider } from "./context/UpdateContext";
import { NetworkProvider } from "./context/NetworkContext";
import { Wizard } from "./components/Wizard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TitleBar } from "./components/TitleBar";
import { UpdateNotification } from "./components/UpdateNotification";
import { UpdateProgress } from "./components/UpdateProgress";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { ResumeModal } from "./components/ResumeModal";
import { InstallationHistory } from "./components/InstallationHistory";
import type { InstallationSession } from "../types";

function AppContent(): JSX.Element {
  const [resumeSession, setResumeSession] = useState<InstallationSession | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { goTo, setAgentName, setPrimaryModel } = useInstallation();

  // Check for active session on mount
  useEffect(() => {
    const checkForActiveSession = async () => {
      try {
        const activeSession = await window.api.session.loadActive();
        if (activeSession && activeSession.status === "active") {
          setResumeSession(activeSession);
        }
      } catch (error) {
        console.error("Failed to check for active session:", error);
      }
    };

    checkForActiveSession();
  }, []);

  const handleResume = async (session: InstallationSession) => {
    try {
      // Restore session state
      setAgentName(session.agentName);
      setPrimaryModel(session.primaryModel);
      // Note: Channel restoration will be handled when user reaches channels step

      // Jump to the step where user left off
      goTo(session.currentStep);
      setResumeSession(null);
    } catch (error) {
      console.error("Failed to resume session:", error);
    }
  };

  const handleStartFresh = async () => {
    try {
      // Clear active session
      await window.api.session.clearActive();
      setResumeSession(null);
      // App will start fresh on next step
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleHistoryResume = (session: InstallationSession) => {
    handleResume(session);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <ConnectionStatus />
      <TitleBar />
      <main className="flex-1 overflow-hidden">
        <Wizard />
      </main>
      <UpdateNotification />
      <UpdateProgress />

      {/* Resume Modal */}
      {resumeSession && (
        <ResumeModal
          session={resumeSession}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onViewHistory={handleViewHistory}
        />
      )}

      {/* Installation History Modal */}
      {showHistory && (
        <InstallationHistory
          onClose={() => setShowHistory(false)}
          onResume={handleHistoryResume}
        />
      )}
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <NetworkProvider>
        <UpdateProvider>
          <LanguageProvider>
            <InstallationProvider>
              <AppContent />
            </InstallationProvider>
          </LanguageProvider>
        </UpdateProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}
