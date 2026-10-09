"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { NotificationRow } from "@/lib/types";

export function NotificationList({ initial }: { initial: NotificationRow[] }) {
  const [notifications, setNotifications] = useState(initial);
  const { t } = useLanguage();

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${n.is_read ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50"}`}
        >
          <div className={`mt-0.5 rounded-lg p-2 ${n.is_read ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-600"}`}>
            {n.is_read ? <BellOff size={16} /> : <Bell size={16} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">{n.title}</p>
            <p className="text-sm text-slate-600">{n.message}</p>
            <p className="mt-1 text-xs text-slate-400">{timeAgo(n.created_at)}</p>
          </div>
          {!n.is_read && (
            <button onClick={() => markRead(n.id)} className="shrink-0 text-xs font-medium text-emerald-700 hover:underline">
              {t("notifications.markRead")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
