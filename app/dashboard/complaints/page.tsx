import Link from "next/link";
import { FileText, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/lib/i18n/server";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/lib/types";

export default async function MyComplaintsPage() {
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("complaints")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const complaints = (data ?? []) as Complaint[];
  const imageUrls = new Map<string, string>();
  await Promise.all(
    complaints
      .filter((c) => c.image_url)
      .map(async (c) => {
        const { data: signed } = await supabase.storage.from("complaint-images").createSignedUrl(c.image_url as string, 3600);
        if (signed?.signedUrl) imageUrls.set(c.id, signed.signedUrl);
      })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("complaints.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{complaints.length} complaint{complaints.length === 1 ? "" : "s"} submitted so far.</p>

      {complaints.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FileText}
            title={t("complaints.noneTitle")}
            message={t("complaints.noneText")}
            actionLabel={t("common.reportProblem")}
            actionHref="/dashboard/report"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/complaints/${c.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="h-40 w-full bg-slate-100">
                {imageUrls.has(c.id) && (
                  <img src={imageUrls.get(c.id)} alt={c.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{c.complaint_code}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
                <p className="text-sm text-slate-500">{c.category}</p>
                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-slate-500">
                  <SeverityBadge severity={c.severity} />
                  <span>Priority {c.priority_score}</span>
                </div>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={12} /> {c.address ?? `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}
                </p>
                <p className="text-xs text-slate-400">{formatDate(c.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
