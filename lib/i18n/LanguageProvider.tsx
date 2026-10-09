"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { translate, LANGUAGE_COOKIE, type Language } from "@/lib/i18n/translations";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLang, children }: { initialLang: Language; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const router = useRouter();

  const setLang = useCallback(
    (next: Language) => {
      setLangState(next);
      document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=31536000`;
      router.refresh();
    },
    [router]
  );

  const t = useCallback((path: string) => translate(lang, path), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
