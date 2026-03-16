import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Terminal, AlertTriangle, RefreshCw } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Installing(): JSX.Element {
  const {
    isInstalling,
    installPercent,
    installMessage,
    installLog,
    installSuccess,
    errorMessage,
    setInstallProgress,
    setInstallComplete,
    goTo,
    buildConfig,
  } = useInstallation();
  const { language } = useLanguage();
  const logRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    window.api.install.onProgress((event) => {
      setIsInitializing(false);
      setInstallProgress(event.percent, event.message, event.log);
    });

    window.api.install.onComplete((event) => {
      setIsInitializing(false);
      setInstallComplete(event.success, event.message, event.dashboardUrl);
      window.api.install.removeListeners();
      if (event.success) {
        setTimeout(() => goTo("success"), 1000);
      }
    });

    const config = buildConfig(language);
    window.api.install.start(config).catch((err) => {
      setIsInitializing(false);
      setInstallComplete(false, String(err));
    });

    return () => {
      window.api.install.removeListeners();
    };
  }, [buildConfig, language, setInstallProgress, setInstallComplete, goTo]);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [installLog]);

  const handleRetry = () => {
    startedRef.current = false;
    goTo("credentials");
  };

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex justify-end mb-2">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {installSuccess === false ? (
          /* Error state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">
                {t(language, "installing.error.title")}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{errorMessage}</p>
            </div>
            <button
              onClick={handleRetry}
              className="no-drag flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors"
            >
              <RefreshCw size={14} />
              {t(language, "installing.error.retry")}
            </button>
          </motion.div>
        ) : (
          /* Installing / success state */
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                {isInstalling || isInitializing ? (
                  <Loader2 size={32} className="text-primary animate-spin" />
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl"
                  >
                    ✅
                  </motion.div>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">
                {isInitializing
                  ? t(language, "installing.initializing")
                  : isInstalling
                  ? t(language, "installing.title")
                  : t(language, "installing.almostDone")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isInitializing
                  ? t(language, "installing.initializing.subtitle")
                  : isInstalling
                  ? t(language, "installing.subtitle")
                  : installMessage}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{installMessage}</span>
                <span className="text-xs font-mono text-primary">{installPercent}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${installPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Log terminal */}
            {installLog.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Terminal size={11} />
                  {t(language, "installing.log.title")}
                </div>
                <div
                  ref={logRef}
                  className="h-28 overflow-y-auto bg-black/40 rounded-lg p-3 border border-border"
                >
                  {installLog.map((line, i) => (
                    <p key={i} className="text-[11px] font-mono text-muted-foreground leading-5">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
