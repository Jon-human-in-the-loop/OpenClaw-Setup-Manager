import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Zap, Cloud, Settings } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { SetupType as SetupTypeValue } from "../../types";

interface TypeOption {
  id: SetupTypeValue;
  icon: JSX.Element;
  nameKey: "setuptype.quick.name" | "setuptype.cloud.name" | "setuptype.full.name";
  descKey: "setuptype.quick.desc" | "setuptype.cloud.desc" | "setuptype.full.desc";
  tagKey: "setuptype.quick.tag" | "setuptype.cloud.tag" | "setuptype.full.tag";
  color: string;
}

const OPTIONS: TypeOption[] = [
  {
    id: "quick",
    icon: <Zap size={20} />,
    nameKey: "setuptype.quick.name",
    descKey: "setuptype.quick.desc",
    tagKey: "setuptype.quick.tag",
    color: "text-green-400",
  },
  {
    id: "cloud",
    icon: <Cloud size={20} />,
    nameKey: "setuptype.cloud.name",
    descKey: "setuptype.cloud.desc",
    tagKey: "setuptype.cloud.tag",
    color: "text-blue-400",
  },
  {
    id: "full",
    icon: <Settings size={20} />,
    nameKey: "setuptype.full.name",
    descKey: "setuptype.full.desc",
    tagKey: "setuptype.full.tag",
    color: "text-purple-400",
  },
];

export function SetupType(): JSX.Element {
  const { setupType, setSetupType, goNext, goPrev } = useInstallation();
  const { language } = useLanguage();

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "setuptype.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {t(language, "setuptype.subtitle")}
        </p>

        <div className="space-y-3">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSetupType(opt.id)}
              className={[
                "no-drag w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all",
                setupType === opt.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
              ].join(" ")}
            >
              {/* Radio */}
              <div className="mt-0.5 flex-shrink-0">
                <div className={[
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  setupType === opt.id ? "border-primary" : "border-muted-foreground",
                ].join(" ")}>
                  {setupType === opt.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>

              {/* Icon + Content */}
              <div className={`flex-shrink-0 mt-0.5 ${opt.color}`}>
                {opt.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    {t(language, opt.nameKey)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {t(language, opt.descKey)}
                </p>
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {t(language, opt.tagKey)}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
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
