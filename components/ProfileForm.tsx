"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", profile.id);
    setSaving(false);
    if (updateError) {
      console.error("[profile] update failed", updateError);
      setError(`Could not update your profile: ${updateError.message}`);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {saved && <SuccessBanner message={t("profile.saved")} />}
      <div>
        <label className="block text-sm font-medium text-slate-700">{t("profile.email")}</label>
        <input disabled value={email} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="fullName">{t("profile.fullName")}</label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="phone">{t("profile.phone")}</label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Optional"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{t("profile.role")}</label>
        <input disabled value={profile.role} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saving ? "Saving..." : t("profile.saveChanges")}
      </button>
    </form>
  );
}
