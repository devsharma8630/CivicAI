import Link from "next/link";
import { FileText, Clock, Hammer, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/lib/types";

export default async function DepartmentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, department_id").eq("id", user!.id).single();

  let departmentName = "Department";
  if (profile?.department_id) {
    const { data: department } = await supabase.from("departments").select("name").eq("id", profile.department_id).single();
    departmentName = department?.name ?? "Department";
  }

  const { data } = await supabase
    .from("complaints")
    .select("*")
    .eq("department", departmentName)
    .order("priority_score", { ascending: false });

  const complaints = (data ?? []) as Complaint[];
  const pending = complaints.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW" || c.status === "ASSIGNED").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{departmentName.toUpperCase()}</p>
      <h1 className="text-2xl font-semibold text-slate-900">Department Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Here is what is assigned to your department.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Assigned" value={complaints.length} icon={FileText} tone="slate" />
        <StatCard label="Pending" value={pending} icon={Clock} tone="amber" />
        <StatCard label="In Progress" value={inProgress} icon={Hammer} tone="indigo" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Recent Complaints</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Complaint</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 8).map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/department/complaints/${c.id}`} className="font-medium text-slate-900 hover:text-sky-700">{c.title}</Link>
                    <p className="text-xs text-slate-400">{c.complaint_code}</p>
                  </td>
                  <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                  <td className="px-4 py-3 font-medium text-slate-700">{c.priority_score}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No complaints assigned to your department yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
