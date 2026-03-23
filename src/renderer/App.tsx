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

  // Check for existing OpenClaw installation → go to Control Center
  useEffect(() => {
    const checkExistingInstallation = async () => {
      try {
        // 1. Comprobar memoria persistente
        const state = await window.api.state.read();
        if (state.installed) {
          goTo("control-center");
          return;
        }

        // 2. Fallback (recuperación de estado si state.json se borró pero Docker sigue vivo)
        const status = await window.api.control.status();
        if (status.state !== "not-found") {
          await window.api.state.write({ installed: true, version: "unknown" });
          goTo("control-center");
          return;
        }
      } catch {
        // APIs fallaron o no están disponibles — continuar con wizard normal
      }

      // If no existing installation, check for active session
      try {
        const activeSession = await window.api.session.loadActive();
        if (activeSession && activeSession.status === "active") {
          setResumeSession(activeSession);
        }
      } catch (error) {
        console.error("Failed to check for active session:", error);
      }
    };

    checkExistingInstallation();
  }, [goTo]);

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
    <div className="flex flex-col absolute inset-0 bg-background overflow-hidden">
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
