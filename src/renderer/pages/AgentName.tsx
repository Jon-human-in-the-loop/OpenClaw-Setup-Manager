import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import { validateAgentName } from "@/lib/validation";

const EMOJI_OPTIONS = ["🦞", "🤖", "🦾", "🧠", "⚡", "🚀", "🎯", "🔮", "🦁", "🐬"];

export function AgentName(): JSX.Element {
  const { agentName, agentEmoji, setAgentName, setAgentEmoji, goNext, goPrev } = useInstallation();
  const { language } = useLanguage();
  const selectedEmoji = agentEmoji;
  const setSelectedEmoji = setAgentEmoji;

  const validation = agentName.trim() ? validateAgentName(agentName.trim()) : null;
  const isValid = validation?.valid ?? false;
  const canContinue = agentName.trim().length >= 2 && isValid;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canContinue) goNext();
  };

  return (
    <div className="flex flex-col h-full px-6 py-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t(language, "agentname.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t(language, "agentname.subtitle")}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Name input */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              {t(language, "agentname.label")}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg select-none">
                {selectedEmoji}
              </span>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t(language, "agentname.placeholder")}
                maxLength={30}
                spellCheck={false}
                className={[
                  "no-drag w-full pl-10 pr-14 py-2.5 rounded-lg bg-muted border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
                  agentName && (!isValid ? "border-destructive/50 ring-destructive/20" : "border-primary/50"),
                  !agentName && "border-border",
                ].join(" ")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                {agentName.length}/30
              </span>
            </div>
            {agentName && !isValid && validation && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2"
              >
                <span className="text-destructive text-xs leading-none mt-0.5">⚠</span>
                <p className="text-xs text-destructive">
                  {language === "es" ? validation.error : validation.errorEn}
                </p>
              </motion.div>
            )}
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">
              {t(language, "agentname.emoji")}
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={[
                    "no-drag w-10 h-10 text-xl rounded-lg border transition-all",
                    selectedEmoji === emoji
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border bg-muted hover:border-primary/50 hover:scale-105",
                  ].join(" ")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {agentName.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-3.5 bg-card rounded-xl border border-primary/20"
            >
              <span className="text-2xl">{selectedEmoji}</span>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {t(language, "agentname.preview")}
                </p>
                <p className="text-sm font-semibold text-foreground">{agentName.trim()}</p>
              </div>
              <Sparkles size={14} className="text-primary ml-auto" />
            </motion.div>
          )}
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
