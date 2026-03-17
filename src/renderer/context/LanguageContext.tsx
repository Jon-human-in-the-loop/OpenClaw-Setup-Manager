import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Language } from "../lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "openclaw-installer-lang";

function detectLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;

  const systemLang = navigator.language.toLowerCase();
  return systemLang.startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
