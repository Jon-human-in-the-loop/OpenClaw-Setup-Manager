import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Loader2, ExternalLink, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { SystemCheckResult, DiagnosticCheck, DiagnosticStatus, CheckSeverity } from "../../types";

const CATEGORY_ORDER = ["os", "docker", "ollama", "network", "storage", "permissions"] as const;

export function SystemCheck(): JSX.Element {
  const { goNext, goPrev, setPlatformCapabilities } = useInstallation();
  const { language } = useLanguage();
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<SystemCheckResult | null>(null);

  // WSL Installation State
  const [wslInstallState, setWslInstallState] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
  const [wslError, setWslError] = useState<string | null>(null);

  const handleInstallWsl = async () => {
    setWslInstallState('installing');
    setWslError(null);
    try {
      const wslResult = await window.api.wsl.install("Ubuntu");
      if (wslResult.success) {
        setWslInstallState('success');
      } else {
        setWslError(wslResult.error ?? "Failed to install WSL");
        setWslInstallState('error');
      }
    } catch (e) {
      setWslError(String(e));
      setWslInstallState('error');
    }
  };

  // Generic Dependencies Installation State
  const [installingDeps, setInstallingDeps] = useState<Record<string, 'idle'|'installing'|'success'|'error'>>({});

  const handleInstallDep = async (depId: string) => {
    setInstallingDeps(prev => ({ ...prev, [depId]: 'installing' }));
    setWslError(null);
    try {
      const res = await window.api.deps.install(depId);
      if (res.success) {
        setInstallingDeps(prev => ({ ...prev, [depId]: 'success' }));
        runCheck(); 
      } else {
        setWslError(res.error ?? `Error al instalar ${depId}`);
        setInstallingDeps(prev => ({ ...prev, [depId]: 'error' }));
      }
    } catch (e) {
      setWslError(String(e));
      setInstallingDeps(prev => ({ ...prev, [depId]: 'error' }));
    }
  };

  const runCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await window.api.system.check();
      setResult(res);
      if (res.platformCapabilities) {
        setPlatformCapabilities(res.platformCapabilities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  // Agrupar diagnósticos por categoría
  const groupedDiagnostics = result?.diagnostics
    ? CATEGORY_ORDER
        .map((cat) => ({
          category: cat,
          items: result.diagnostics.filter((d) => d.category === cat),
        }))
        .filter((g) => g.items.length > 0)
    : [];

  // Determinar si hay errores críticos que bloquean
  const hasCriticalErrors = result?.diagnostics?.some(
    (d) => d.severity === "critical" && (d.status === "missing" || d.status === "incompatible"),
  ) ?? false;

  const hasWarnings = result?.diagnostics?.some(
    (d) => d.status === "review" || d.status === "recommended",
  ) ?? false;

  const canContinue = !checking && !hasCriticalErrors;

  const statusIcon = (status: DiagnosticStatus) => {
    if (status === "ready") return <Check size={14} className="text-primary" strokeWidth={2.5} />;
    if (status === "recommended") return <Info size={14} className="text-blue-400" />;
    if (status === "review") return <AlertTriangle size={14} className="text-yellow-500" />;
    if (status === "missing") return <X size={14} className="text-destructive" strokeWidth={2.5} />;
    if (status === "incompatible") return <X size={14} className="text-destructive" strokeWidth={2.5} />;
    return <Loader2 size={14} className="animate-spin text-muted-foreground" />;
  };

  const severityBadge = (severity: CheckSeverity) => {
    const key = `diag.severity.${severity}` as Parameters<typeof t>[1];
    const colors = {
      critical: "bg-destructive/20 text-destructive",
      recommended: "bg-yellow-500/20 text-yellow-500",
      optional: "bg-blue-500/20 text-blue-400",
    };
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors[severity]}`}>
        {t(language, key)}
      </span>
    );
  };

  const itemBorderClass = (d: DiagnosticCheck) => {
    if (d.status === "missing" || d.status === "incompatible") return "border-destructive/30 bg-destructive/5";
    if (d.status === "review") return "border-yellow-500/30 bg-yellow-500/5";
    if (d.status === "recommended") return "border-blue-500/30 bg-blue-500/5";
    return "border-border bg-card";
  };

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "systemcheck.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t(language, "systemcheck.subtitle")}
        </p>

        {/* Diagnostics by category */}
        {checking ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t(language, "systemcheck.checking")}</span>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedDiagnostics.map((group) => (
              <div key={group.category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t(language, `diag.category.${group.category}` as Parameters<typeof t>[1])}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex flex-col gap-1 p-3 rounded-lg border ${itemBorderClass(item)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {statusIcon(item.status)}
                          <span className="text-sm font-medium text-foreground">{item.detail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {severityBadge(item.severity)}
                        </div>
                      </div>

                      {item.id === "wsl2" && item.status !== "ready" && (
                        <div className="mt-3 p-3 bg-secondary/30 border border-border rounded-lg">
                          <h4 className="text-sm font-semibold mb-1 text-foreground">
                            {language === "es" ? "Instalación Automática Recomendada" : "Recommended Auto-Install"}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            {language === "es" 
                              ? "OpenClaw instalará el Subsistema de Windows para Linux (Ubuntu). Aparecerá una ventana de permisos de Administrador."
                              : "OpenClaw will install the Windows Subsystem for Linux (Ubuntu). An Administrator prompt will appear."}
                          </p>
                          
                          {wslInstallState === 'idle' && (
                            <button
                              onClick={handleInstallWsl}
                              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
                            >
                              {language === "es" ? "Instalar WSL (Recomendado)" : "Install WSL (Recommended)"}
                            </button>
                          )}
                          
                          {wslInstallState === 'installing' && (
                            <div className="flex items-center gap-2 text-xs text-primary font-medium">
                              <Loader2 size={14} className="animate-spin" />
                              {language === "es" 
                                ? "Instalando... Acepta los permisos de Administrador y espera a que termine la consola."
                                : "Installing... Accept the Administrator prompt and wait for the console to finish."}
                            </div>
                          )}
                          
                          {wslInstallState === 'success' && (
                            <div className="flex flex-col gap-3">
                              <span className="text-xs text-green-500 font-medium">
                                {language === "es" 
                                  ? "¡WSL Instalado! Debes reiniciar tu PC para aplicar los cambios y luego volver a abrir el instalador."
                                  : "WSL Installed! You must restart your PC to apply changes, then reopen the installer."}
                              </span>
                              <button
                                onClick={() => window.api.system.reboot()}
                                className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-md hover:bg-destructive/90 self-start transition-colors"
                              >
                                {language === "es" ? "Reiniciar PC Ahora" : "Restart PC Now"}
                              </button>
                            </div>
                          )}
                          
                          {wslInstallState === 'error' && (
                            <div className="text-xs text-destructive mt-2 font-medium">
                              Error: {wslError}
                            </div>
                          )}
                        </div>
                      )}

                      {item.fixUrl && item.status !== "ready" && item.id !== "wsl2" && (
                        <div className="flex items-center justify-end mt-2 gap-3">
                          {['node', 'git', 'ollama', 'docker'].includes(item.id) && result?.platform === 'win32' && (
                            <div className="flex items-center gap-2">
                              {installingDeps[item.id] === 'installing' ? (
                                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                                  <Loader2 size={12} className="animate-spin" />
                                  {language === "es" ? "Instalando..." : "Installing..."}
                                </div>
                              ) : installingDeps[item.id] === 'success' ? (
                                <span className="text-xs text-green-500 font-medium tracking-tight">
                                  {language === "es" ? "¡Instalado!" : "Installed!"}
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleInstallDep(item.id)}
                                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                  {language === "es" ? "Instalar Autom." : "Auto-Install"}
                                </button>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => window.api.system.openUrl(item.fixUrl!)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                          >
                            <ExternalLink size={10} />
                            {t(language, "common.openLink")}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status message */}
        {!checking && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <p className={`text-sm font-medium ${
              canContinue
                ? hasWarnings
                  ? "text-yellow-500"
                  : "text-primary"
                : "text-destructive"
            }`}>
              {canContinue
                ? hasWarnings
                  ? t(language, "systemcheck.hasWarnings")
                  : t(language, "systemcheck.allGood")
                : t(language, "systemcheck.hasErrors")}
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
        <button
          onClick={goPrev}
          className="no-drag flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          {t(language, "common.back")}
        </button>
        <div className="flex-1" />
        {!checking && (hasCriticalErrors || hasWarnings) && (
          <button
            onClick={runCheck}
            className="no-drag flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            {t(language, "systemcheck.fixAndRetry")}
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="no-drag flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t(language, "systemcheck.continue")}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
