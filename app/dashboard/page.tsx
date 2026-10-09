import Link from "next/link";
import { FileText, Clock, Hammer, CheckCircle2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/lib/i18n/server";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();

  const { data } = await supabase
    .from("complaints")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const complaints = (data ?? []) as Complaint[];
  const pending = complaints.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW").length;
  const inProgress = complaints.filter((c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("dashboard.welcome")}{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("dashboard.overview")}</p>
        </div>
        <Link href="/dashboard/report" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700">
          <Plus size={16} /> {t("common.reportProblem")}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dashboard.totalComplaints")} value={complaints.length} icon={FileText} tone="slate" />
        <StatCard label={t("dashboard.pending")} value={pending} icon={Clock} tone="amber" />
        <StatCard label={t("dashboard.inProgress")} value={inProgress} icon={Hammer} tone="indigo" />
        <StatCard label={t("dashboard.resolved")} value={resolved} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.recentComplaints")}</h2>
        {complaints.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={FileText}
              title={t("dashboard.noComplaintsTitle")}
              message={t("dashboard.noComplaintsText")}
              actionLabel={t("common.reportProblem")}
              actionHref="/dashboard/report"
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t("report.fieldTitle")}</th>
                  <th className="px-4 py-3">{t("report.fieldCategory")}</th>
                  <th className="px-4 py-3">{t("report.fieldSeverity")}</th>
                  <th className="px-4 py-3">{t("report.fieldPriority")}</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 6).map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/complaints/${c.id}`} className="font-medium text-slate-900 hover:text-emerald-700">
                        {c.title}
                      </Link>
                      <p className="text-xs text-slate-400">{c.complaint_code}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.category}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                    <td className="px-4 py-3 font-medium text-slate-700">{c.priority_score}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
