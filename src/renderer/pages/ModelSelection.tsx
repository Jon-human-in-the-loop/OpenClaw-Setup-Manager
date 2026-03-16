import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, HelpCircle, AlertTriangle } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MODEL_PROVIDERS, type LLMModel } from "@/lib/models";

export function ModelSelection(): JSX.Element {
  const { primaryModel, setPrimaryModel, goNext, goPrev, setupType } = useInstallation();
  const { language } = useLanguage();
  const [activeProvider, setActiveProvider] = useState(() => {
    if (setupType === "quick") return "local";
    const found = MODEL_PROVIDERS.find((p) => p.models.some((m) => m.id === primaryModel));
    return found?.id ?? "anthropic";
  });

  const provider = MODEL_PROVIDERS.find((p) => p.id === activeProvider)!;
  const visibleProviders = setupType === "quick" ? MODEL_PROVIDERS.filter(p => p.id === "local") : MODEL_PROVIDERS;

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "model.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {t(language, "model.subtitle")}
        </p>

        {/* Provider Tabs */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {visibleProviders.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProvider(p.id);
                setPrimaryModel(p.models.find((m) => m.recommended)?.id ?? p.models[0].id);
              }}
              className={[
                "no-drag px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeProvider === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Model list */}
        <div className="space-y-2 mb-4">
          {provider.models.map((model: LLMModel, i) => (
            <motion.button
              key={model.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setPrimaryModel(model.id)}
              className={[
                "no-drag w-full text-left flex items-start gap-3 p-3.5 rounded-lg border transition-all",
                primaryModel === model.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/30",
              ].join(" ")}
            >
              <div className="mt-0.5 flex-shrink-0">
                <div className={[
                  "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                  primaryModel === model.id ? "border-primary" : "border-muted-foreground",
                ].join(" ")}>
                  {primaryModel === model.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">{model.name}</span>
                  {model.recommended && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                      {t(language, "common.recommended")}
                    </span>
                  )}
                  {model.context && (
                    <span className="text-[10px] text-muted-foreground ml-auto">{model.context} ctx</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "es" ? model.description : model.descriptionEn}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Local vs Cloud badge */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
          <HelpCircle size={14} className="text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            {provider.requiresApiKey
              ? t(language, "model.cloud.badge")
              : t(language, "model.local.badge")}
          </p>
        </div>

        {/* Anthropic Ban Risk Warning */}
        {activeProvider === "anthropic" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-lg border border-red-500/50 bg-red-950/20 mb-4"
          >
            <div className="flex gap-3 items-start">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">
                  {t(language, "model.warning.anthropic.title")}
                </h4>
                <p className="text-xs text-red-300/90 leading-relaxed mb-2">
                  {t(language, "model.warning.anthropic.description")}
                </p>
                <ul className="text-xs text-red-300/70 space-y-1">
                  <li>• {t(language, "model.warning.anthropic.point1")}</li>
                  <li>• {t(language, "model.warning.anthropic.point2")}</li>
                  <li>• {t(language, "model.warning.anthropic.point3")}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Google Gemini Ban Risk Warning */}
        {activeProvider === "google" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-lg border border-red-500/50 bg-red-950/20 mb-4"
          >
            <div className="flex gap-3 items-start">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">
                  {t(language, "model.warning.gemini.title")}
                </h4>
                <p className="text-xs text-red-300/90 leading-relaxed mb-2">
                  {t(language, "model.warning.gemini.description")}
                </p>
                <ul className="text-xs text-red-300/70 space-y-1">
                  <li>• {t(language, "model.warning.gemini.point1")}</li>
                  <li>• {t(language, "model.warning.gemini.point2")}</li>
                  <li>• {t(language, "model.warning.gemini.point3")}</li>
                </ul>
              </div>
            </div>
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
        <button
          onClick={goNext}
          className="no-drag flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t(language, "common.next")}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
