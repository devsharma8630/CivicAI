"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TrendChart, CategoryBarChart, DistributionPieChart } from "@/components/admin/AnalyticsCharts";
import type { Complaint } from "@/lib/types";

const RANGE_DAYS: Record<string, number | null> = { today: 1, "7": 7, "30": 30, "90": 90, all: null };

export default function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [range, setRange] = useState<string>("30");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("complaints").select("*").then(({ data }) => setComplaints((data ?? []) as Complaint[]));
  }, []);

  const filtered = useMemo(() => {
    if (!complaints) return [];
    const days = RANGE_DAYS[range];
    if (days === null) return complaints;
    const cutoff = Date.now() - days * 86400000;
    return complaints.filter((c) => new Date(c.created_at).getTime() >= cutoff);
  }, [complaints, range]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of filtered) {
      const day = new Date(c.created_at).toISOString().slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [filtered]);

  const byCategory = useMemo(() => toCounts(filtered, (c) => c.category), [filtered]);
  const bySeverity = useMemo(() => toCounts(filtered, (c) => c.severity), [filtered]);
  const byStatus = useMemo(() => toCounts(filtered, (c) => c.status), [filtered]);
  const byLocation = useMemo(() => toCounts(filtered, (c) => c.address ?? "Unspecified").slice(0, 8), [filtered]);

  const resolved = filtered.filter((c) => c.resolved_at);
  const avgResolutionHours = resolved.length
    ? Math.round(resolved.reduce((sum, c) => sum + (new Date(c.resolved_at as string).getTime() - new Date(c.created_at).getTime()) / 3600000, 0) / resolved.length)
    : 0;
  const duplicateCount = filtered.filter((c) => c.duplicate_group_id).length;
  const suspiciousCount = filtered.filter((c) => c.is_suspicious).length;

  if (!complaints) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Insights across all civic complaints.</p>
        </div>
        <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1">
          {[
            { key: "today", label: "Today" },
            { key: "7", label: "7 Days" },
            { key: "30", label: "30 Days" },
            { key: "90", label: "90 Days" },
            { key: "all", label: "All" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${range === r.key ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Average Resolution Time</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{avgResolutionHours ? `${avgResolutionHours}h` : "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Duplicate Complaints</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{duplicateCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Suspicious Complaints</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{suspiciousCount}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">Complaints Over Time</h3>
          <div className="mt-4 h-64"><TrendChart data={trend} /></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">By Category</h3>
          <div className="mt-4 h-72"><CategoryBarChart data={byCategory} /></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">By Severity</h3>
          <div className="mt-4 h-72"><DistributionPieChart data={bySeverity} /></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">By Status</h3>
          <div className="mt-4 h-72"><DistributionPieChart data={byStatus} /></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">Top Locations</h3>
          <div className="mt-4 h-72"><CategoryBarChart data={byLocation} /></div>
        </div>
      </div>
    </div>
  );
}

function toCounts<T>(items: T[], key: (item: T) => string): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}
