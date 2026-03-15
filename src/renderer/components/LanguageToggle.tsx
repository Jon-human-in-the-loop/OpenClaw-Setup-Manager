import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle(): JSX.Element {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="no-drag flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
      {(["es", "en"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={[
            "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
            language === lang
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Globe size={10} />
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
