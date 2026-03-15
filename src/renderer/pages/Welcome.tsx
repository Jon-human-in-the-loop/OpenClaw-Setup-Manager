import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Welcome(): JSX.Element {
  const { goNext } = useInstallation();
  const { language } = useLanguage();

  const steps = [
    "welcome.steps.1",
    "welcome.steps.2",
    "welcome.steps.3",
    "welcome.steps.4",
    "welcome.steps.5",
  ] as const;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Language Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <LanguageToggle />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md"
        >
          {/* Logo/Icon */}
          <div className="text-5xl mb-5">🦞</div>

          <h1 className="text-2xl font-bold text-foreground leading-tight whitespace-pre-line mb-3">
            {t(language, "welcome.title")}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-8">
            {t(language, "welcome.subtitle")}
          </p>

          {/* Steps list */}
          <div className="text-left space-y-2.5 mb-8">
            {steps.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-primary" strokeWidth={3} />
                </div>
                <span className="text-sm text-foreground/80">
                  {t(language, key)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goNext}
            className="no-drag w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            {t(language, "welcome.cta")}
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
