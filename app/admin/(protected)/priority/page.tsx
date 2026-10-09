import Link from "next/link";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { priorityColor, timeAgo } from "@/lib/format";
import type { Complaint } from "@/lib/types";

export default async function PriorityQueuePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("complaints")
    .select("*")
    .not("status", "in", "(RESOLVED,REJECTED)")
    .order("priority_score", { ascending: false });

  const complaints = (data ?? []) as Complaint[];
  const groupCounts = new Map<string, number>();
  for (const c of complaints) {
    if (c.duplicate_group_id) groupCounts.set(c.duplicate_group_id, (groupCounts.get(c.duplicate_group_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">AI Priority Queue</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sorted by AI-calculated priority score. This is decision support for triage — administrators make the final call.
      </p>

      {complaints.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Flame} title="Queue is empty" message="There are no active complaints awaiting review." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {complaints.map((c, i) => (
            <Link
              key={c.id}
              href={`/admin/complaints/${c.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <div className="w-10 shrink-0 text-center text-sm font-semibold text-slate-400">#{i + 1}</div>
              <div className={`w-16 shrink-0 text-center text-2xl font-bold ${priorityColor(c.priority_score)}`}>{c.priority_score}</div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-400">{c.complaint_code} · {c.address ?? `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={c.severity} />
                <StatusBadge status={c.status} />
              </div>
              <div className="w-32 shrink-0 text-right text-xs text-slate-400">
                {c.duplicate_group_id && groupCounts.get(c.duplicate_group_id)! > 1 && (
                  <p className="font-medium text-amber-600">{groupCounts.get(c.duplicate_group_id)} similar reports</p>
                )}
                <p>{timeAgo(c.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
