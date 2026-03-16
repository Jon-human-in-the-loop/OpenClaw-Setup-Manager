import { LanguageProvider } from "./context/LanguageContext";
import { InstallationProvider } from "./context/InstallationContext";
import { UpdateProvider } from "./context/UpdateContext";
import { Wizard } from "./components/Wizard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TitleBar } from "./components/TitleBar";
import { UpdateNotification } from "./components/UpdateNotification";
import { UpdateProgress } from "./components/UpdateProgress";

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <UpdateProvider>
        <LanguageProvider>
          <InstallationProvider>
            <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
              <TitleBar />
              <main className="flex-1 overflow-hidden">
                <Wizard />
              </main>
              <UpdateNotification />
              <UpdateProgress />
            </div>
          </InstallationProvider>
        </LanguageProvider>
      </UpdateProvider>
    </ErrorBoundary>
  );
}
