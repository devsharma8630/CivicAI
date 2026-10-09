import { cookies } from "next/headers";
import { translate, LANGUAGE_COOKIE, type Language } from "@/lib/i18n/translations";

export async function getLanguage(): Promise<Language> {
  const store = await cookies();
  const value = store.get(LANGUAGE_COOKIE)?.value;
  return value === "hi" ? "hi" : "en";
}

export async function getTranslator() {
  const lang = await getLanguage();
  return { lang, t: (path: string) => translate(lang, path) };
}
