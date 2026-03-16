import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Eye, EyeOff, ExternalLink, Shield, Check, X } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import { validateApiKey } from "@/lib/validation";
import { getProviderForModel } from "@/lib/models";

export function ApiKey(): JSX.Element {
  const { apiKey, setApiKey, primaryModel, goNext, goPrev } = useInstallation();
  const { language } = useLanguage();
  const [showKey, setShowKey] = useState(false);

  const provider = getProviderForModel(primaryModel);
  const providerName = provider?.name ?? "API";
  const providerId = provider?.id ?? "openai";

  const validation = apiKey.trim() ? validateApiKey(apiKey.trim(), providerId) : null;
  const isValid = validation?.valid ?? false;
  const canContinue = isValid;

  const guideKey = `apikey.guide.${providerId}` as "apikey.guide.anthropic" | "apikey.guide.openai" | "apikey.guide.google";
  const apiKeyUrl = provider?.apiKeyUrl;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canContinue) goNext();
  };

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "apikey.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t(language, "apikey.subtitle")}
        </p>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              {t(language, "apikey.label", { provider: providerName })}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t(language, "apikey.placeholder")}
                spellCheck={false}
                autoComplete="off"
                className={[
                  "no-drag w-full pr-20 pl-4 py-2.5 rounded-lg bg-muted border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
                  apiKey && (isValid ? "border-primary/50" : "border-destructive/50"),
                  !apiKey && "border-border",
                ].join(" ")}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {apiKey && (
                  <span className={isValid ? "text-primary" : "text-destructive"}>
                    {isValid ? <Check size={13} strokeWidth={2.5} /> : <X size={13} />}
                  </span>
                )}
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="no-drag p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Validation message */}
            {apiKey && !isValid && validation && (
              <p className="mt-1.5 text-xs text-destructive">
                {language === "es" ? validation.error : validation.errorEn}
              </p>
            )}
          </div>

          {/* Guide */}
          <div className="flex flex-col gap-2 p-3.5 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs font-medium text-foreground">
              {t(language, "apikey.where")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(language, guideKey)}
            </p>
            {apiKeyUrl && (
              <button
                onClick={() => window.api.system.openUrl(apiKeyUrl)}
                className="no-drag flex items-center gap-1.5 text-xs text-primary hover:underline w-fit"
              >
                <ExternalLink size={11} />
                {t(language, "common.getKey")}
              </button>
            )}
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2 p-3 bg-card rounded-lg border border-border">
            <Shield size={13} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {t(language, "apikey.security")}
            </p>
          </div>
        </motion.div>
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
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="no-drag flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t(language, "common.next")}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
