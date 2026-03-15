import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";

interface GuideStep {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  url?: string;
}

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleEn: string;
  steps: GuideStep[];
}

export function GuideModal({ open, onClose, title, titleEn, steps }: GuideModalProps): JSX.Element {
  const { language } = useLanguage();
  const heading = language === "es" ? title : titleEn;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Steps */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {language === "es" ? step.title : step.titleEn}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {language === "es" ? step.description : step.descriptionEn}
                      </p>
                      {step.url && (
                        <button
                          onClick={() => window.api.system.openUrl(step.url!)}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink size={10} />
                          {step.url}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border">
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
                >
                  {t(language, "common.understood")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
