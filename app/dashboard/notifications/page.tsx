import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/lib/i18n/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationList } from "@/components/NotificationList";
import type { NotificationRow } from "@/lib/types";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const notifications = (data ?? []) as NotificationRow[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("notifications.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("notifications.subtitle")}</p>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title={t("notifications.none")} message={t("dashboard.noComplaintsText")} />
        ) : (
          <NotificationList initial={notifications} />
        )}
      </div>
    </div>
  );
}
