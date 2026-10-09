"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LanguageSwitcher({ className, dark = false }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useLanguage();
  const inactive = dark ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-500 hover:bg-slate-100";
  const divider = dark ? "text-slate-600" : "text-slate-300";
  return (
    <div className={className ?? "flex items-center gap-1 text-sm"}>
      <button
        onClick={() => setLang("en")}
        className={`rounded-lg px-2 py-1 font-medium transition-colors ${lang === "en" ? "bg-emerald-600 text-white" : inactive}`}
      >
        English
      </button>
      <span className={divider}>|</span>
      <button
        onClick={() => setLang("hi")}
        className={`rounded-lg px-2 py-1 font-medium transition-colors ${lang === "hi" ? "bg-emerald-600 text-white" : inactive}`}
      >
        हिंदी
      </button>
    </div>
  );
}
