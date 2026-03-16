import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Loader2, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { SystemCheckResult } from "../../types";

type CheckStatus = "pending" | "ok" | "warn" | "error";

interface CheckItem {
  id: string;
  labelKey: string;
  status: CheckStatus;
  detail: string;
  fixKey?: string;
  fixUrl?: string;
}

export function SystemCheck(): JSX.Element {
  const { goNext, goPrev, setPlatformCapabilities } = useInstallation();
  const { language } = useLanguage();
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<SystemCheckResult | null>(null);
  const [items, setItems] = useState<CheckItem[]>([]);

  const runCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await window.api.system.check();
      setResult(res);
      buildItems(res);
      // Pasar capabilities al contexto para que Deployment las use
      if (res.platformCapabilities) {
        setPlatformCapabilities(res.platformCapabilities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const buildItems = (res: SystemCheckResult) => {
    const built: CheckItem[] = [
      {
        id: "node",
        labelKey: "systemcheck.node",
        status: res.nodeMeetsRequirement ? "ok" : res.nodeInstalled ? "error" : "error",
        detail: res.nodeInstalled
          ? res.nodeMeetsRequirement
            ? t(language, "systemcheck.node.ok", { version: res.nodeVersion ?? "" })
            : t(language, "systemcheck.node.outdated", { version: res.nodeVersion ?? "" })
          : t(language, "systemcheck.node.missing"),
        fixKey: res.nodeMeetsRequirement ? undefined : "systemcheck.fix.node",
        fixUrl: res.nodeMeetsRequirement ? undefined : "https://nodejs.org/en/download",
      },
      {
        id: "port",
        labelKey: "systemcheck.port",
        status: res.portAvailable ? "ok" : "error",
        detail: res.portAvailable
          ? t(language, "systemcheck.port.ok")
          : t(language, "systemcheck.port.busy"),
        fixKey: res.portAvailable ? undefined : "systemcheck.fix.port",
      },
      {
        id: "disk",
        labelKey: "systemcheck.disk",
        status: res.diskSpaceMeetsRequirement ? "ok" : "error",
        detail: res.diskSpaceMeetsRequirement
          ? t(language, "systemcheck.disk.ok", { gb: String(res.diskSpaceGB) })
          : t(language, "systemcheck.disk.low", { gb: String(res.diskSpaceGB) }),
        fixKey: res.diskSpaceMeetsRequirement ? undefined : "systemcheck.fix.disk",
      },
      {
        id: "git",
        labelKey: "systemcheck.git",
        status: res.gitInstalled ? "ok" : "warn",
        detail: res.gitInstalled
          ? t(language, "systemcheck.git.ok")
          : t(language, "systemcheck.git.missing"),
      },
    ];
    setItems(built);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const hasErrors = items.some((i) => i.status === "error");
  const canContinue = !checking && !hasErrors;

  const statusIcon = (status: CheckStatus) => {
    if (status === "ok") return <Check size={14} className="text-primary" strokeWidth={2.5} />;
    if (status === "warn") return <AlertTriangle size={14} className="text-yellow-500" />;
    if (status === "error") return <X size={14} className="text-destructive" strokeWidth={2.5} />;
    return <Loader2 size={14} className="animate-spin text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "systemcheck.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t(language, "systemcheck.subtitle")}
        </p>

        {/* Check items */}
        <div className="space-y-3">
          {checking && items.length === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t(language, "systemcheck.checking")}</span>
            </div>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={[
                  "flex flex-col gap-1 p-3 rounded-lg border",
                  item.status === "error" ? "border-destructive/30 bg-destructive/5" :
                  item.status === "warn" ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-border bg-card",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t(language, item.labelKey as Parameters<typeof t>[1])}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                    {statusIcon(item.status)}
                  </div>
                </div>

                {item.fixKey && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-destructive">
                      {t(language, item.fixKey as Parameters<typeof t>[1])}
                    </p>
                    {item.fixUrl && (
                      <button
                        onClick={() => window.api.system.openUrl(item.fixUrl!)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline ml-2"
                      >
                        <ExternalLink size={10} />
                        {t(language, "common.openLink")}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Status message */}
        {!checking && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <p className={`text-sm font-medium ${canContinue ? "text-primary" : "text-destructive"}`}>
              {canContinue
                ? t(language, "systemcheck.allGood")
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
        {!checking && hasErrors && (
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
