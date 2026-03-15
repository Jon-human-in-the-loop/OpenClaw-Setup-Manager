import { Minus, Square, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";

export function TitleBar(): JSX.Element {
  const { language } = useLanguage();
  const isMac = navigator.platform.toLowerCase().includes("mac");

  return (
    <div className="drag-region flex items-center h-10 px-3 bg-background border-b border-border shrink-0 select-none">
      {/* Mac: traffic lights are built-in via titleBarStyle: hidden */}
      {/* Windows/Linux: custom controls on the right */}
      <div className="flex-1 flex items-center gap-2">
        {isMac && <div className="w-16" />}
        <span className="text-xs text-muted-foreground font-medium tracking-wide">
          {t(language, "titlebar.title")}
        </span>
      </div>

      {!isMac && (
        <div className="no-drag flex items-center gap-0.5">
          <button
            onClick={() => window.api.window.minimize()}
            className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={() => window.api.window.maximize()}
            className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Square size={11} />
          </button>
          <button
            onClick={() => window.api.window.close()}
            className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
