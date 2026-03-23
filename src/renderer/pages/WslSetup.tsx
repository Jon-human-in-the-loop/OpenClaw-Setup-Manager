import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  RotateCw,
} from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { WslDetailedStatus } from "../../types";

type Phase =
  | "checking"
  | "not-installed"
  | "installing-wsl"
  | "needs-reboot"
  | "installing-distro"
  | "ready"
  | "error";

export function WslSetup(): JSX.Element {
  const { goNext } = useInstallation();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<Phase>("checking");
  const [errorMsg, setErrorMsg] = useState("");

  async function check(force = false) {
    setPhase("checking");
    try {
      const status: WslDetailedStatus = await window.api.wsl.status(force);

      if (status.status === "ready") {
        setPhase("ready");
        // Auto-advance after a brief confirmation pause
        setTimeout(() => goNext(), 1200);
        return;
      }

      if (status.status === "no-distro") {
        setPhase("installing-distro");
        await installDistro();
        return;
      }

      // not-installed
      setPhase("not-installed");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }

  async function installDistro() {
    try {
      const result = await window.api.wsl.install("Ubuntu");
      if (result.success) {
        // Re-check after distro install
        await check(true);
      } else {
        setErrorMsg(result.error ?? "Unknown error");
        setPhase("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }

  async function handleInstallWsl() {
    setPhase("installing-wsl");
    try {
      const result = await window.api.wsl.installWsl();
      if (result.success) {
        setPhase("needs-reboot");
      } else {
        setErrorMsg(result.error ?? "Unknown error");
        setPhase("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }

  async function handleReboot() {
    try {
      await window.api.system.reboot();
    } catch {
      // Reboot initiated — app will exit
    }
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex justify-end mb-2">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              {phase === "checking" || phase === "installing-wsl" || phase === "installing-distro" ? (
                <Loader2 size={32} className="text-primary animate-spin" />
              ) : phase === "ready" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle2 size={32} className="text-green-400" />
                </motion.div>
              ) : phase === "needs-reboot" ? (
                <RotateCw size={32} className="text-yellow-400" />
              ) : (
                <Terminal size={32} className="text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {t(language, "wslsetup.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(language, "wslsetup.subtitle")}
            </p>
          </div>

          {/* State-specific content */}
          {phase === "checking" && (
            <p className="text-center text-sm text-muted-foreground">
              {t(language, "wslsetup.checking")}
            </p>
          )}

          {phase === "not-installed" && (
            <div className="p-4 bg-card border border-border rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {t(language, "wslsetup.notinstalled.title")}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(language, "wslsetup.notinstalled.desc")}
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstallWsl}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Terminal size={14} />
                {t(language, "wslsetup.install.button")}
              </button>
            </div>
          )}

          {phase === "installing-wsl" && (
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="text-sm text-muted-foreground text-center">
                {t(language, "wslsetup.installing")}
              </p>
            </div>
          )}

          {phase === "needs-reboot" && (
            <div className="p-4 bg-card border border-border rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <RotateCw className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {t(language, "wslsetup.reboot.title")}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(language, "wslsetup.reboot.desc")}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReboot}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RotateCw size={14} />
                {t(language, "wslsetup.reboot.button")}
              </button>
            </div>
          )}

          {phase === "installing-distro" && (
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="font-semibold text-foreground text-sm mb-1">
                {t(language, "wslsetup.nodistro.title")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(language, "wslsetup.nodistro.desc")}
              </p>
            </div>
          )}

          {phase === "ready" && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="font-semibold text-green-400 text-sm mb-1">
                {t(language, "wslsetup.ready.title")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(language, "wslsetup.ready.desc")}
              </p>
            </div>
          )}

          {phase === "error" && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {t(language, "wslsetup.error")}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{errorMsg}</p>
                </div>
              </div>
              <button
                onClick={() => check(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw size={14} />
                {t(language, "wslsetup.retry")}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
