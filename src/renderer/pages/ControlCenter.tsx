import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Square, RotateCw, Settings, Terminal, ExternalLink, 
  Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  ChevronRight, Wrench, FileWarning, Search, Zap, Check, Download, Loader2, ScrollText 
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import type {
  ContainerStatus,
  ContainerState,
  ControlActionResult,
  RepairIssue,
} from "../../types";

// ─── Status Visual Mapping ───────────────────────────────────

type StatusColor = "green" | "yellow" | "red" | "gray";

function getStatusColor(state: ContainerState): StatusColor {
  switch (state) {
    case "running":
      return "green";
    case "restarting":
      return "yellow";
    case "stopped":
    case "error":
      return "red";
    case "not-found":
      return "gray";
  }
}

function getStatusLabel(state: ContainerState, lang: string): string {
  const labels: Record<ContainerState, Record<string, string>> = {
    running: { es: "Operativo", en: "Running" },
    stopped: { es: "Detenido", en: "Stopped" },
    restarting: { es: "Reiniciando", en: "Restarting" },
    "not-found": { es: "No encontrado", en: "Not found" },
    error: { es: "Error", en: "Error" },
  };
  return labels[state]?.[lang] ?? labels[state]?.en ?? state;
}

const StatusIcon = ({ color }: { color: StatusColor }) => {
  const colorClasses: Record<StatusColor, string> = {
    green: "text-emerald-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    gray: "text-gray-500",
  };
  return <Circle size={10} className={`fill-current ${colorClasses[color]}`} />;
};

// ─── Component ───────────────────────────────────────────────

export function ControlCenter(): JSX.Element {
  const { language } = useLanguage();
  const [status, setStatus] = useState<ContainerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [repairIssues, setRepairIssues] = useState<RepairIssue[]>([]);
  const [showRepair, setShowRepair] = useState(false);
  const [repairLoading, setRepairLoading] = useState(false);

  // Version Control
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>("latest");
  const [selectedVersion, setSelectedVersion] = useState<string>("latest");
  const [isUpdatingVersion, setIsUpdatingVersion] = useState(false);

  // Autostart
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(false);

  const fetchVersions = async () => {
    try {
      const [curRes, availRes] = await Promise.all([
        window.api.update.getCurrentVersion(),
        window.api.update.getAvailableVersions()
      ]);
      if (curRes.success && curRes.version) {
        setCurrentVersion(curRes.version);
        setSelectedVersion(curRes.version);
      }
      if (availRes.success && availRes.tags.length > 0) {
        setAvailableVersions(availRes.tags);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const refreshStatus = useCallback(async () => {
    try {
      const result = await window.api.control.status();
      setStatus(result);
    } catch (err) {
      console.error("Failed to get container status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and listen for real-time updates
  useEffect(() => {
    refreshStatus();
    fetchVersions();
    
    // Check initial autostart status
    window.api.autostart.getStatus().then(setAutostartEnabled).catch(console.error);

    // Listen for backend background monitoring events
    window.api.control.onStatusChanged((newStatus) => {
      setStatus(newStatus);
      setLoading(false);
    });

    return () => {
      window.api.control.removeStatusListener();
    };
  }, [refreshStatus]);

  const handleAction = async (
    action: () => Promise<ControlActionResult>,
    actionName: string
  ) => {
    setActionInProgress(actionName);
    setActionMessage(null);
    try {
      const result = await action();
      setActionMessage(result.message);
      if (result.action === "logs" && result.data) {
        setLogs(result.data);
        setShowLogs(true);
      }
      // Refresh status after action
      await refreshStatus();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDiagnose = async () => {
    setRepairLoading(true);
    setShowRepair(true);
    try {
      const issues = await window.api.repair.diagnose();
      setRepairIssues(issues);
    } catch (err) {
      console.error("Diagnosis failed:", err);
    } finally {
      setRepairLoading(false);
    }
  };

  const handleFix = async (issueId: string) => {
    setRepairLoading(true);
    try {
      await window.api.repair.fix(issueId);
      // Re-diagnose to see updated state
      const issues = await window.api.repair.diagnose();
      setRepairIssues(issues);
      await refreshStatus();
    } catch (err) {
      console.error("Fix failed:", err);
    } finally {
      setRepairLoading(false);
    }
  };

  const handleExportScript = async () => {
    setActionInProgress("export");
    setActionMessage(null);
    try {
      const result = await window.api.exportUtils.script();
      if (result.success && result.filePath) {
        setActionMessage(language === "es" ? `Guardado en ${result.filePath}` : `Saved to ${result.filePath}`);
      } else if (result.error) {
        setActionMessage(result.error);
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error exporting script");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleExportDiagnostics = async () => {
    setActionInProgress("export-diag");
    setActionMessage(null);
    try {
      const result = await window.api.diagnostic.export();
      if (result.success && result.data) {
        setActionMessage(language === "es" ? `Diagnóstico guardado en ${result.data}` : `Diagnostics saved to ${result.data}`);
      } else if (result.message) {
        setActionMessage(result.message);
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error exporting diagnostics");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApplyVersion = async () => {
    if (selectedVersion === currentVersion) return;
    setIsUpdatingVersion(true);
    setActionMessage(language === "es" ? `Actualizando a versión ${selectedVersion}... esto puede tardar unos minutos.` : `Updating to version ${selectedVersion}... this may take a few minutes.`);
    try {
      const result = await window.api.update.applyVersion(selectedVersion);
      if (result.success) {
        setCurrentVersion(selectedVersion);
        setActionMessage(language === "es" ? `Actualizado a ${selectedVersion}` : `Updated to ${selectedVersion}`);
        await refreshStatus();
      } else {
        setActionMessage(result.message);
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error apply version");
    } finally {
      setIsUpdatingVersion(false);
    }
  };

  const handleToggleAutostart = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enable = e.target.checked;
    setAutostartLoading(true);
    try {
      const result = await window.api.autostart.toggle(enable);
      if (result.success && result.enabled !== undefined) {
        setAutostartEnabled(result.enabled);
        setActionMessage(
          language === "es" 
            ? `Arranque automático ${result.enabled ? "activado" : "desactivado"}`
            : `Autostart ${result.enabled ? "enabled" : "disabled"}`
        );
      } else {
        setActionMessage(result.error || "Error toggling autostart");
        // Revert UI state if failed
        setAutostartEnabled(!enable); 
      }
    } catch (err) {
      setActionMessage(String(err));
      setAutostartEnabled(!enable);
    } finally {
      setAutostartLoading(false);
    }
  };

  const isRunning = status?.state === "running";
  const statusColor = status ? getStatusColor(status.state) : "gray";

  return (
    <div className="flex flex-col h-full px-6 py-5 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          🦞 {language === "es" ? "Centro de Control" : "Control Center"}
        </h1>
        <LanguageToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4"
      >
        {/* Status Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {loading ? (
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              ) : (
                <StatusIcon color={statusColor} />
              )}
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {status ? getStatusLabel(status.state, language) : "..."}
                </h2>
                {status?.uptime && (
                  <p className="text-xs text-muted-foreground">
                    {language === "es" ? "Activo:" : "Uptime:"} {status.uptime}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={refreshStatus}
              disabled={loading}
              className="no-drag p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Endpoint Status */}
          {status && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs">
                {status.dashboardReachable ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <XCircle size={12} className="text-red-400" />
                )}
                <span className="text-muted-foreground">Dashboard :3000</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {status.gatewayReachable ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <XCircle size={12} className="text-red-400" />
                )}
                <span className="text-muted-foreground">Gateway :18789</span>
              </div>
            </div>
          )}

            {/* Container Info & Version */}
            <div className="flex flex-col gap-1 mt-1">
              {status?.containerId && (
                <p className="text-[10px] text-muted-foreground font-mono">
                  Container: {status.containerId}
                  {status.health && status.health !== "none" && ` · ${status.health}`}
                </p>
              )}
              {availableVersions.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {language === "es" ? "Versión:" : "Version:"}
                  </span>
                  <select 
                    className="no-drag text-[10px] bg-background border border-border rounded px-1.5 py-0.5 max-w-[100px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    disabled={isUpdatingVersion || !!actionInProgress}
                  >
                    {availableVersions.map(v => (
                      <option key={v} value={v}>{v} {v === currentVersion ? "(Current)" : ""}</option>
                    ))}
                  </select>
                  {selectedVersion !== currentVersion && (
                    <button 
                      onClick={handleApplyVersion}
                      disabled={isUpdatingVersion || !!actionInProgress}
                      className="no-drag text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isUpdatingVersion ? (
                        <Loader2 size={10} className="animate-spin inline" />
                      ) : language === "es" ? "Aplicar" : "Apply"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        {/* Settings / Autostart Section (Epic 5) */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autostartEnabled}
              onChange={handleToggleAutostart}
              disabled={autostartLoading}
              className="no-drag accent-primary"
            />
            <span>
              {language === "es" 
                ? "Iniciar OpenClaw al arrancar el sistema" 
                : "Start OpenClaw on system boot"}
            </span>
            {autostartLoading && <Loader2 size={12} className="animate-spin" />}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleAction(
                isRunning
                  ? () => window.api.control.stop()
                  : () => window.api.control.start(),
                isRunning ? "stop" : "start"
              )
            }
            disabled={!!actionInProgress}
            className={`no-drag flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
              isRunning
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            }`}
          >
            {actionInProgress === "start" || actionInProgress === "stop" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isRunning ? (
              <Square size={14} />
            ) : (
              <Play size={14} />
            )}
            {isRunning
              ? language === "es"
                ? "Detener"
                : "Stop"
              : language === "es"
                ? "Iniciar"
                : "Start"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleAction(() => window.api.control.restart(), "restart")
            }
            disabled={!!actionInProgress || !isRunning}
            className="no-drag flex items-center justify-center gap-2 py-2.5 px-4 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            {actionInProgress === "restart" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCw size={14} />
            )}
            {language === "es" ? "Reiniciar" : "Restart"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleAction(() => window.api.control.openDashboard(), "dashboard")
            }
            disabled={!status?.dashboardReachable}
            className="no-drag flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <ExternalLink size={14} />
            Dashboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleAction(() => window.api.control.openConfig(), "config")
            }
            className="no-drag flex items-center justify-center gap-2 py-2.5 px-4 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <Terminal size={14} />
            {language === "es" ? "Config" : "Config"}
          </motion.button>
        </div>

        {/* Logs & Repair quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() =>
              handleAction(() => window.api.control.logs(50), "logs")
            }
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ScrollText size={12} />
            {language === "es" ? "Logs" : "Logs"}
          </button>
          <button
            onClick={handleDiagnose}
            disabled={repairLoading}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Wrench size={12} />
            {language === "es" ? "Soporte" : "Support"}
          </button>
          <button
            onClick={handleExportDiagnostics}
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {actionInProgress === "export-diag" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Download size={12} />
            )}
            {language === "es" ? "Diag" : "Diag"}
          </button>
        </div>

        {/* Export Script */}
        <button
          onClick={handleExportScript}
          disabled={!!actionInProgress}
          className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-dashed border-border mt-1"
        >
          {actionInProgress === "export" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Download size={12} />
          )}
          {language === "es" ? "Exportar Bash Script" : "Export Bash Script"}
        </button>

        {/* Action feedback */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-center text-muted-foreground bg-muted/50 rounded-lg p-2"
            >
              {actionMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logs panel */}
        <AnimatePresence>
          {showLogs && logs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">
                  {language === "es" ? "Logs del contenedor" : "Container Logs"}
                </span>
                <button
                  onClick={() => setShowLogs(false)}
                  className="no-drag text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <pre className="p-3 text-[10px] font-mono text-muted-foreground max-h-48 overflow-y-auto whitespace-pre-wrap">
                {logs}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Repair panel */}
        <AnimatePresence>
          {showRepair && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">
                  {language === "es" ? "Diagnóstico" : "Diagnostics"}
                </span>
                <button
                  onClick={() => setShowRepair(false)}
                  className="no-drag text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 space-y-2">
                {repairLoading ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">
                      {language === "es" ? "Analizando..." : "Analyzing..."}
                    </span>
                  </div>
                ) : repairIssues.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-xs">
                      {language === "es"
                        ? "Todo en orden. No se encontraron problemas."
                        : "All clear. No issues found."}
                    </span>
                  </div>
                ) : (
                  repairIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <div className="mt-0.5">
                        {issue.severity === "critical" ? (
                          <XCircle size={12} className="text-red-400" />
                        ) : (
                          <AlertCircle size={12} className="text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {issue.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {issue.description}
                        </p>
                      </div>
                      {issue.autoFixable && (
                        <button
                          onClick={() => handleFix(issue.id)}
                          disabled={repairLoading}
                          className="no-drag shrink-0 text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                        >
                          {language === "es" ? "Reparar" : "Fix"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
