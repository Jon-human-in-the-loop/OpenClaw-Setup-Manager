import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";

interface ChannelOption {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  { id: "whatsapp", nameKey: "channels.whatsapp", descKey: "channels.whatsapp.desc", icon: "💬" },
  { id: "telegram", nameKey: "channels.telegram", descKey: "channels.telegram.desc", icon: "✈️" },
  { id: "discord", nameKey: "channels.discord", descKey: "channels.discord.desc", icon: "🎮" },
  { id: "slack", nameKey: "channels.slack", descKey: "channels.slack.desc", icon: "🔧" },
  { id: "none", nameKey: "channels.none", descKey: "channels.none.desc", icon: "🔌" },
];

export function Channels(): JSX.Element {
  const { channels, toggleChannel, goNext, goPrev } = useInstallation();
  const { language } = useLanguage();

  const canContinue = channels.size > 0;

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "channels.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {t(language, "channels.subtitle")}
        </p>

        <div className="space-y-2.5">
          {CHANNEL_OPTIONS.map((opt, i) => {
            const isSelected = channels.has(opt.id);
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => toggleChannel(opt.id)}
                className={[
                  "no-drag w-full text-left flex items-center gap-4 p-3.5 rounded-xl border transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/30",
                  opt.id === "none" && "mt-4",
                ].join(" ")}
              >
                {/* Checkbox */}
                <div className={[
                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "bg-primary border-primary" : "border-muted-foreground",
                ].join(" ")}>
                  {isSelected && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-primary-foreground fill-current">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <span className="text-xl shrink-0">{opt.icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {t(language, opt.nameKey as Parameters<typeof t>[1])}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(language, opt.descKey as Parameters<typeof t>[1])}
                  </p>
                </div>
              </motion.button>
            );
          })}
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
