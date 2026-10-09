"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Complaint, ComplaintStatus, Severity } from "@/lib/types";

type SortKey = "priority" | "newest" | "oldest";

export function AdminComplaintsTable() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "ALL">("ALL");
  const [severity, setSeverity] = useState<Severity | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("priority");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("complaints")
      .select("*")
      .then(({ data }) => setComplaints((data ?? []) as Complaint[]));
  }, []);

  const filtered = useMemo(() => {
    if (!complaints) return [];
    const term = search.trim().toLowerCase();
    let result = complaints.filter((c) => {
      const matchesTerm =
        !term ||
        c.complaint_code.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        (c.address ?? "").toLowerCase().includes(term) ||
        (c.department ?? "").toLowerCase().includes(term);
      const matchesStatus = status === "ALL" || c.status === status;
      const matchesSeverity = severity === "ALL" || c.severity === severity;
      return matchesTerm && matchesStatus && matchesSeverity;
    });
    result = result.sort((a, b) => {
      if (sort === "priority") return b.priority_score - a.priority_score;
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return result;
  }, [complaints, search, status, severity, sort]);

  if (!complaints) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, category, location, department"
            className="w-full text-sm outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as ComplaintStatus | "ALL")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All statuses</option>
          {["PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "ALL")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All severities</option>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="priority">Highest Priority</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Complaint</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Reported</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/complaints/${c.id}`} className="font-medium text-slate-900 hover:text-emerald-700">{c.title}</Link>
                  <p className="text-xs text-slate-400">{c.complaint_code}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.category}</td>
                <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                <td className="px-4 py-3 font-medium text-slate-700">{c.priority_score}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-slate-600">{c.department ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No complaints match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
