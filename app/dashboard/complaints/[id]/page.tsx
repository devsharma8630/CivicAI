import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/lib/i18n/server";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Complaint, ComplaintHistoryRow, ComplaintAIAnalysis } from "@/lib/types";

const TIMELINE_STEPS = ["PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED"] as const;

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: complaint } = await supabase.from("complaints").select("*").eq("id", id).eq("user_id", user!.id).single();
  if (!complaint) notFound();
  const c = complaint as Complaint;

  const { data: updates } = await supabase
    .from("complaint_history")
    .select("*")
    .eq("complaint_id", id)
    .order("created_at", { ascending: true });
  const { data: analysisRows } = await supabase
    .from("complaint_ai_analysis")
    .select("*")
    .eq("complaint_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  let imageUrl: string | null = null;
  if (c.image_url) {
    const { data: signed } = await supabase.storage.from("complaint-images").createSignedUrl(c.image_url, 3600);
    imageUrl = signed?.signedUrl ?? null;
  }

  let resolutionImageUrl: string | null = null;
  if (c.resolution_image_path) {
    const { data: signed } = await supabase.storage.from("complaint-images").createSignedUrl(c.resolution_image_path, 3600);
    resolutionImageUrl = signed?.signedUrl ?? null;
  }

  const analysis = (analysisRows?.[0] ?? null) as ComplaintAIAnalysis | null;
  const timeline = (updates ?? []) as ComplaintHistoryRow[];
  const currentStepIndex = c.status === "REJECTED" ? -1 : TIMELINE_STEPS.indexOf(c.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/dashboard/complaints" className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
        <ArrowLeft size={16} /> {t("complaints.title")}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{c.complaint_code}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{c.title}</h1>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={c.severity} />
          <StatusBadge status={c.status} />
        </div>
      </div>

      {imageUrl && (
        <img src={imageUrl} alt={c.title} className="mt-6 max-h-96 w-full rounded-2xl border border-slate-200 object-cover" />
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Category</p>
          <p className="mt-1 font-medium text-slate-900">{c.category}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Priority Score</p>
          <p className="mt-1 font-medium text-slate-900">{c.priority_score}/100</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
          <p className="mt-1 font-medium text-slate-900">{c.department ?? "Unassigned"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400"><MapPin size={12} /> Location</p>
          <p className="mt-1 font-medium text-slate-900">{c.address ?? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldDescription")}</p>
        <p className="mt-2 whitespace-pre-line text-slate-700">{c.description}</p>
        {analysis && (
          <p className="mt-3 text-xs text-slate-400">AI confidence: {Math.round((analysis.confidence ?? 0) * 100)}%</p>
        )}
      </div>

      {(c.resolution_note || resolutionImageUrl) && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs uppercase tracking-wide text-emerald-700">{t("complaints.resolution")}</p>
          {c.resolution_note && <p className="mt-2 text-slate-700">{c.resolution_note}</p>}
          {resolutionImageUrl && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {imageUrl && (
                <div>
                  <p className="mb-1 text-xs text-slate-500">{t("complaints.before")}</p>
                  <img src={imageUrl} alt="Before" className="max-h-56 w-full rounded-xl object-cover" />
                </div>
              )}
              <div>
                <p className="mb-1 text-xs text-slate-500">{t("complaints.after")}</p>
                <img src={resolutionImageUrl} alt="After" className="max-h-56 w-full rounded-xl object-cover" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">{t("complaints.timeline")}</h2>
        {c.status === "REJECTED" ? (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t("complaints.rejectedNote")}</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {TIMELINE_STEPS.map((stepStatus, i) => {
              const reached = i <= currentStepIndex;
              const update = timeline.find((u) => u.new_status === stepStatus);
              return (
                <li key={stepStatus} className="flex items-start gap-3">
                  <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full transition-colors ${reached ? "bg-emerald-600" : "bg-slate-200"}`} />
                  <div>
                    <p className={`text-sm font-medium ${reached ? "text-slate-900" : "text-slate-400"}`}>
                      {t(`status.${stepStatus}`)}
                    </p>
                    {update && <p className="text-xs text-slate-400">{formatDate(update.created_at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {timeline.some((u) => u.note) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">{t("complaints.adminNotes")}</h2>
          <div className="mt-3 space-y-3">
            {timeline.filter((u) => u.note).map((u) => (
              <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <p className="text-slate-700">{u.note}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(u.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
