import type { Metadata } from "next";
import "./globals.css";
import { getLanguage } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "CivicAI",
  description: "Report Problems. Improve Your City.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLanguage();
  return (
    <html lang={lang}>
      <body>
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
