"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Complaint, ComplaintStatus } from "@/lib/types";

export function DepartmentComplaintsTable() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as ComplaintStatus | null) ?? "ALL";
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "ALL">(initialStatus);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("complaints")
      .select("*")
      .order("priority_score", { ascending: false })
      .then(({ data }) => setComplaints((data ?? []) as Complaint[]));
  }, []);

  const filtered = useMemo(() => {
    if (!complaints) return [];
    const term = search.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesTerm = !term || c.complaint_code.toLowerCase().includes(term) || c.title.toLowerCase().includes(term);
      const matchesStatus = status === "ALL" || c.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [complaints, search, status]);

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
            placeholder="Search by complaint number or title"
            className="w-full text-sm outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as ComplaintStatus | "ALL")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All statuses</option>
          {["PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Complaint</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/department/complaints/${c.id}`} className="font-medium text-slate-900 hover:text-sky-700">{c.title}</Link>
                  <p className="text-xs text-slate-400">{c.complaint_code}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.category}</td>
                <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                <td className="px-4 py-3 font-medium text-slate-700">{c.priority_score}</td>
                <td className="px-4 py-3 text-slate-600">{c.address ?? `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No complaints match this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
