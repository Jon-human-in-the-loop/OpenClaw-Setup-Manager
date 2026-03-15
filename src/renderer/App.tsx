import { LanguageProvider } from "./context/LanguageContext";
import { InstallationProvider } from "./context/InstallationContext";
import { Wizard } from "./components/Wizard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TitleBar } from "./components/TitleBar";

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <InstallationProvider>
          <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
            <TitleBar />
            <main className="flex-1 overflow-hidden">
              <Wizard />
            </main>
          </div>
        </InstallationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
