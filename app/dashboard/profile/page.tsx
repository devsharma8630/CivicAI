import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/lib/i18n/server";
import { ProfileForm } from "@/components/ProfileForm";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("profile.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("profile.subtitle")}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <ProfileForm profile={data as Profile} email={user!.email ?? ""} />
      </div>
    </div>
  );
}
