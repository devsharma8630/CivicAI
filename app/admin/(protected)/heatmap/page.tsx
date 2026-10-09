"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Complaint, ComplaintStatus, Severity } from "@/lib/types";

const DensityMap = dynamic(() => import("@/components/map/DensityMap").then((m) => m.DensityMap), {
  ssr: false,
  loading: () => <div className="h-[600px] animate-pulse rounded-2xl bg-slate-100" />,
});

export default function HeatmapPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [category, setCategory] = useState("ALL");
  const [severity, setSeverity] = useState<Severity | "ALL">("ALL");
  const [status, setStatus] = useState<ComplaintStatus | "ALL">("ALL");
  const [since, setSince] = useState("ALL");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("complaints").select("*").then(({ data }) => setComplaints((data ?? []) as Complaint[]));
  }, []);

  const categories = useMemo(() => Array.from(new Set((complaints ?? []).map((c) => c.category))).sort(), [complaints]);

  const filtered = useMemo(() => {
    if (!complaints) return [];
    const cutoff = since === "ALL" ? null : Date.now() - Number(since) * 86400000;
    return complaints.filter((c) => {
      if (category !== "ALL" && c.category !== category) return false;
      if (severity !== "ALL" && c.severity !== severity) return false;
      if (status !== "ALL" && c.status !== status) return false;
      if (cutoff && new Date(c.created_at).getTime() < cutoff) return false;
      return true;
    });
  }, [complaints, category, severity, status, since]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Civic Heatmap</h1>
      <p className="mt-1 text-sm text-slate-500">Identify areas with a high concentration of complaints.</p>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "ALL")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All severities</option>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as ComplaintStatus | "ALL")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All statuses</option>
          {["PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={since} onChange={(e) => setSince(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="mt-6">
        {complaints === null ? (
          <div className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : (
          <DensityMap complaints={filtered} />
        )}
      </div>
    </div>
  );
}
