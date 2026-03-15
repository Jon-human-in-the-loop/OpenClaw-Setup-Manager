import { motion } from "framer-motion";
import { ExternalLink, BookOpen, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { getModel } from "@/lib/models";

const DASHBOARD_URL = "http://127.0.0.1:18789";
const DOCS_URL = "https://github.com/openclaw/openclaw";

export function Success(): JSX.Element {
  const { agentName, primaryModel, channels, dashboardUrl } = useInstallation();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const url = dashboardUrl || DASHBOARD_URL;
  const model = getModel(primaryModel);
  const activeChannels = Array.from(channels).filter((c) => c !== "none");

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full px-6 py-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center gap-5 pt-4"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="text-6xl"
        >
          🦞
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {t(language, "success.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(language, "success.subtitle")}
          </p>
        </div>

        {/* Agent info card */}
        <div className="w-full max-w-xs bg-card border border-border rounded-xl p-4 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{t(language, "success.agent.name")}</span>
            <span className="text-sm font-semibold text-foreground">{agentName}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{t(language, "success.agent.model")}</span>
            <span className="text-sm font-medium text-foreground">{model?.name ?? primaryModel}</span>
          </div>
          {activeChannels.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{t(language, "success.agent.channels")}</span>
                <div className="flex gap-1">
                  {activeChannels.map((ch) => (
                    <span
                      key={ch}
                      className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full capitalize"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-muted-foreground">{t(language, "success.agent.url")}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-primary truncate max-w-[140px]">{url}</span>
              <button
                onClick={handleCopyUrl}
                className="no-drag p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.api.system.openUrl(url)}
            className="no-drag w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <ExternalLink size={15} />
            {t(language, "success.dashboard")}
          </motion.button>

          <button
            onClick={() => window.api.system.openUrl(DOCS_URL)}
            className="no-drag w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-muted text-foreground font-medium rounded-xl text-sm hover:bg-muted/80 transition-colors"
          >
            <BookOpen size={14} />
            {t(language, "success.docs")}
          </button>
        </div>

        {/* Tip */}
        <p className="text-xs text-muted-foreground max-w-xs">
          {t(language, "success.tip")}
        </p>
      </motion.div>
    </div>
  );
}
