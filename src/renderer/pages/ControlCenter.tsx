import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Square, RotateCw, Settings, Terminal, ExternalLink, 
  Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  ChevronRight, Wrench, FileWarning, Search, Zap, Check, Download, Loader2, ScrollText,
  Circle
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import type {
  ContainerStatus,
  ContainerState,
  ControlActionResult,
  RepairIssue,
  AuditLogEntry,
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
  const [persistentLogs, setPersistentLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [repairIssues, setRepairIssues] = useState<RepairIssue[]>([]);
  const [showRepair, setShowRepair] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [repairLoading, setRepairLoading] = useState(false);

  // Backup modal
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupMode, setBackupMode] = useState<"export" | "import">("export");
  const [backupPassword, setBackupPassword] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

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

    // Epic 12: Real-time health updates from background loop
    window.api.system.onHealthUpdate((health) => {
      setStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          state: health.docker === "running" ? (health.openclaw === "running" ? "running" : "stopped") : "stopped",
          dashboardReachable: health.openclaw === "running",
          lastCheckedAt: new Date(health.timestamp).getTime()
        };
      });
    });

    return () => {
      window.api.control.removeStatusListener();
      window.api.system.removeHealthListener();
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
        try {
          const pLogs = await window.api.control.containerLogs(200);
          setPersistentLogs(pLogs);
        } catch (err) {
          console.error("Failed fetching persistent logs:", err);
          setPersistentLogs([]);
        }
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
    }
  };
  
  const handleViewAuditLogs = async () => {
    setActionInProgress("logs");
    try {
      const logs = await window.api.state.getAuditLog(50);
      setAuditLogs(logs);
      setShowAuditLogs(true);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBackup = async () => {
    if (!backupPassword || backupPassword.length < 4) {
      setBackupMessage(language === "es" ? "La contraseña debe tener al menos 4 caracteres." : "Password must be at least 4 characters.");
      return;
    }
    setBackupLoading(true);
    setBackupMessage(null);
    try {
      if (backupMode === "export") {
        const result = await window.api.backup.export(backupPassword);
        setBackupMessage(result.message);
        if (result.success) {
          setTimeout(() => { setShowBackupModal(false); setBackupPassword(""); setBackupMessage(null); }, 2000);
        }
      } else {
        const result = await window.api.backup.import(backupPassword);
        setBackupMessage(result.message);
        if (result.success) {
          setTimeout(() => { setShowBackupModal(false); setBackupPassword(""); setBackupMessage(null); }, 2500);
        }
      }
    } catch (err) {
      setBackupMessage(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBackupLoading(false);
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
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              handleAction(() => window.api.control.logs(50), "logs")
            }
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 rounded-lg transition-colors"
          >
            <Terminal size={12} />
            {language === "es" ? "Logs Docker" : "Docker Logs"}
          </button>
          
          <button
            onClick={handleViewAuditLogs}
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 rounded-lg transition-colors"
          >
            <ScrollText size={12} />
            {language === "es" ? "Historial" : "History"}
          </button>

          <button
            onClick={handleDiagnose}
            disabled={repairLoading}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 rounded-lg transition-colors"
          >
            <Wrench size={12} />
            {language === "es" ? "Soporte" : "Support"}
          </button>

          <button
            onClick={handleExportDiagnostics}
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 rounded-lg transition-colors"
          >
            {actionInProgress === "export-diag" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Download size={12} />
            )}
            {language === "es" ? "Exportar Diagnóstico" : "Export Diagnostics"}
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

        {/* Backup / Restore buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => { setBackupMode("export"); setBackupPassword(""); setBackupMessage(null); setShowBackupModal(true); }}
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-amber-500/10 border border-amber-500/30 rounded-lg transition-colors"
          >
            <Download size={12} />
            {language === "es" ? "Exportar Backup" : "Export Backup"}
          </button>
          <button
            onClick={() => { setBackupMode("import"); setBackupPassword(""); setBackupMessage(null); setShowBackupModal(true); }}
            disabled={!!actionInProgress}
            className="no-drag flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-emerald-500/10 border border-emerald-500/30 rounded-lg transition-colors"
          >
            <RefreshCw size={12} />
            {language === "es" ? "Restaurar Backup" : "Restore Backup"}
          </button>
        </div>

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
              <div className="flex flex-col">
                <div className="p-3 text-[10px] font-mono text-muted-foreground max-h-48 overflow-y-auto whitespace-pre-wrap border-b border-border/50">
                  <div className="font-bold text-foreground mb-1 select-none">
                    {language === "es" ? "Consola en Vivo (stdout/stderr):" : "Live Console (stdout/stderr):"}
                  </div>
                  {logs}
                </div>
                {persistentLogs.length > 0 && (
                  <div className="p-3 text-[10px] font-mono max-h-48 overflow-y-auto bg-muted/20">
                    <div className="font-bold text-foreground mb-1 select-none">
                      {language === "es" ? "Historial Permanente de Errores (Doble Capa):" : "Permanent Error History (Dual-Layer):"}
                    </div>
                    {persistentLogs.map((plog: any, index: number) => (
                      <div key={plog.id || index} className={plog.level === "ERROR" ? "text-red-400" : "text-yellow-400"}>
                        <span className="text-muted-foreground mr-2">[{new Date(plog.timestamp).toLocaleString()}]</span>
                        <span className="font-semibold">{plog.level}:</span> {plog.line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

        {/* Audit Logs Modal */}
        <AnimatePresence>
          {showAuditLogs && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="no-drag w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[80vh]"
              >
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <ScrollText size={18} className="text-primary" />
                    {language === "es" ? "Historial de Acciones (Audit Log)" : "Action History (Audit Log)"}
                  </div>
                  <button
                    onClick={() => setShowAuditLogs(false)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground italic">
                      {language === "es" ? "No hay registros todavía." : "No logs available yet."}
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg border border-border bg-muted/10 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between font-medium">
                          <span className="uppercase text-[10px] tracking-wider text-primary">{log.action}</span>
                          <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-foreground">{log.detail}</div>
                        <div className={`font-mono ${log.result === 'success' || log.result === 'ok' ? 'text-green-500' : log.result === 'warning' ? 'text-amber-500' : 'text-destructive'}`}>
                          Result: {log.result}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => setShowAuditLogs(false)}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90"
                  >
                    {language === "es" ? "Cerrar" : "Close"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── Backup / Restore Password Modal ─── */}
        <AnimatePresence>
          {showBackupModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="no-drag w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col gap-4"
              >
                <div className="text-foreground font-semibold text-base">
                  {backupMode === "export"
                    ? (language === "es" ? "Exportar Backup Cifrado" : "Export Encrypted Backup")
                    : (language === "es" ? "Restaurar desde Backup" : "Restore from Backup")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backupMode === "export"
                    ? (language === "es"
                        ? "El archivo .occlaw sera cifrado con AES-256-GCM usando esta contraseña. Sin ella, no se puede descifrar."
                        : "The .occlaw file will be encrypted with AES-256-GCM using this password. Without it, it cannot be decrypted.")
                    : (language === "es"
                        ? "Introduce la contraseña que usaste al exportar el backup."
                        : "Enter the password you used when exporting the backup.")}
                </p>
                <input
                  type="password"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBackup()}
                  placeholder={language === "es" ? "Contraseña..." : "Password..."}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {backupMessage && (
                  <p className={`text-xs ${backupMessage.toLowerCase().includes("correct") || backupMessage.toLowerCase().includes("guardado") || backupMessage.toLowerCase().includes("restaurado") ? "text-emerald-400" : "text-destructive"}`}>
                    {backupMessage}
                  </p>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowBackupModal(false); setBackupPassword(""); setBackupMessage(null); }}
                    className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    {language === "es" ? "Cancelar" : "Cancel"}
                  </button>
                  <button
                    onClick={handleBackup}
                    disabled={backupLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {backupLoading && <Loader2 size={12} className="animate-spin" />}
                    {backupMode === "export"
                      ? (language === "es" ? "Exportar" : "Export")
                      : (language === "es" ? "Restaurar" : "Restore")}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
