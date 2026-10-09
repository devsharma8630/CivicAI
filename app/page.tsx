"use client";

import Link from "next/link";
import { Sparkles, ListOrdered, Copy, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useLanguage();
  const features = [
    { icon: Sparkles, title: t("home.featureAiTitle"), text: t("home.featureAiText") },
    { icon: ListOrdered, title: t("home.featurePriorityTitle"), text: t("home.featurePriorityText") },
    { icon: Copy, title: t("home.featureDupTitle"), text: t("home.featureDupText") },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={22} />
          <span className="text-lg font-semibold text-slate-900 sm:text-xl">CivicAI</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-sm sm:gap-3">
          <LanguageSwitcher className="mr-1 hidden items-center gap-1 sm:flex" />
          <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:px-4">
            {t("common.login")}
          </Link>
          <Link href="/admin/login" className="rounded-lg px-3 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:px-4">
            {t("common.adminLogin")}
          </Link>
        </div>
      </nav>
      <div className="flex justify-center sm:hidden">
        <LanguageSwitcher />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="mb-3 text-sm font-medium text-emerald-700">{t("home.tagline")}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t("home.heroTitle")}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">{t("home.heroSubtitle")}</p>
        <Link
          href="/dashboard/report"
          className="mt-8 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
        >
          {t("common.reportProblem")}
        </Link>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 sm:pb-24 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <f.icon size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{f.title}</h2>
            <p className="mt-2 text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
