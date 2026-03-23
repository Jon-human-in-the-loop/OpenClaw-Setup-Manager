import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Terminal, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
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
    goPrev,
    buildConfig,
  } = useInstallation();
  const { language } = useLanguage();
  const logRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dashboardOk, setDashboardOk] = useState<boolean | null>(null);
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);

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
        setIsVerifying(true);
        // Verify dashboard and gateway respond before proceeding
        const verify = async () => {
          const maxAttempts = 12;
          let dashboard = false;
          let gateway = false;
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const status = await window.api.control.status();
              dashboard = status.dashboardReachable;
              gateway = status.gatewayReachable;
              setDashboardOk(dashboard);
              setGatewayOk(gateway);
              if (dashboard && gateway) break;
            } catch {
              // ignore
            }
            if (i < maxAttempts - 1) {
              await new Promise((r) => setTimeout(r, 5000));
            }
          }
          setTimeout(() => goTo("success"), 800);
        };
        verify();
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
    goPrev();
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
            className="flex flex-col items-center text-center gap-4 max-w-sm"
          >
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                {t(language, "installing.error.title")}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              {installLog.length > 0 && (
                <div className="p-3 bg-black/40 rounded-lg border border-border text-left max-h-40 overflow-y-auto mb-4">
                  {installLog.slice(-5).map((line, i) => (
                    <p key={i} className="text-[10px] font-mono text-muted-foreground leading-4">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="no-drag flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw size={14} />
                {t(language, "installing.error.retry")}
              </button>
            </div>
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

            {/* Verification panel */}
            {isVerifying && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-card border border-border rounded-xl space-y-3"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {language === "es" ? "Verificando servicios..." : "Verifying services..."}
                </p>
                <div className="flex items-center gap-2">
                  {dashboardOk === null
                    ? <Loader2 size={14} className="text-primary animate-spin" />
                    : dashboardOk
                    ? <CheckCircle2 size={14} className="text-primary" />
                    : <Loader2 size={14} className="text-primary animate-spin" />}
                  <span className="text-sm text-foreground">
                    Dashboard {dashboardOk === null ? (language === "es" ? "verificando..." : "checking...") : dashboardOk ? "✓ 127.0.0.1:3000" : (language === "es" ? "iniciando..." : "starting...")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {gatewayOk === null
                    ? <Loader2 size={14} className="text-primary animate-spin" />
                    : gatewayOk
                    ? <CheckCircle2 size={14} className="text-primary" />
                    : <Loader2 size={14} className="text-primary animate-spin" />}
                  <span className="text-sm text-foreground">
                    Gateway {gatewayOk === null ? (language === "es" ? "verificando..." : "checking...") : gatewayOk ? "✓ 127.0.0.1:18789" : (language === "es" ? "iniciando..." : "starting...")}
                  </span>
                </div>
              </motion.div>
            )}

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
