import { FileText, Clock, Flame, ShieldAlert, CheckCircle2, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { AdminOverviewCharts } from "@/components/admin/AdminOverviewCharts";
import type { Complaint } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
  const complaints = (data ?? []) as Complaint[];

  const pending = complaints.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW").length;
  const high = complaints.filter((c) => c.severity === "HIGH").length;
  const critical = complaints.filter((c) => c.severity === "CRITICAL").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED");

  const resolutionHours = resolved
    .filter((c) => c.resolved_at)
    .map((c) => (new Date(c.resolved_at as string).getTime() - new Date(c.created_at).getTime()) / 3600000);
  const avgResolution = resolutionHours.length
    ? Math.round(resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length)
    : 0;

  const recentHighPriority = [...complaints]
    .filter((c) => c.status !== "RESOLVED" && c.status !== "REJECTED")
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 6);

  const categoryCounts = Object.entries(
    complaints.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusCounts = Object.entries(
    complaints.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const trendMap = new Map<string, number>();
  for (const c of complaints) {
    const day = new Date(c.created_at).toISOString().slice(0, 10);
    trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
  }
  const trend = Array.from(trendMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Live overview of all citizen-reported civic issues.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={complaints.length} icon={FileText} tone="slate" />
        <StatCard label="Pending" value={pending} icon={Clock} tone="amber" />
        <StatCard label="High" value={high} icon={Flame} tone="amber" />
        <StatCard label="Critical" value={critical} icon={ShieldAlert} tone="red" />
        <StatCard label="Resolved" value={resolved.length} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Avg. Resolution" value={avgResolution ? `${avgResolution}h` : "—"} icon={Timer} tone="indigo" />
      </div>

      <AdminOverviewCharts trend={trend} categoryCounts={categoryCounts} statusCounts={statusCounts} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Recent High-Priority Complaints</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Complaint</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reported</th>
              </tr>
            </thead>
            <tbody>
              {recentHighPriority.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <a href={`/admin/complaints/${c.id}`} className="font-medium text-slate-900 hover:text-emerald-700">{c.title}</a>
                    <p className="text-xs text-slate-400">{c.complaint_code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.category}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                  <td className="px-4 py-3 font-medium text-slate-700">{c.priority_score}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                </tr>
              ))}
              {recentHighPriority.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No active complaints right now.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
