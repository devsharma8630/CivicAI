"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Users2, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import { formatDate, STATUS_ORDER, STATUS_LABELS } from "@/lib/format";
import type { Complaint, ComplaintHistoryRow, ComplaintStatus } from "@/lib/types";

export function DepartmentComplaintDetail({ id }: { id: string }) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryRow[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resolutionImageUrl, setResolutionImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: c, error: complaintError } = await supabase.from("complaints").select("*").eq("id", id).single();
    if (complaintError || !c) {
      setError("This complaint is not assigned to your department, or does not exist.");
      setLoading(false);
      return;
    }
    const complaintData = c as Complaint;
    setComplaint(complaintData);
    setResolutionNote(complaintData.resolution_note ?? "");

    const { data: historyRows } = await supabase
      .from("complaint_history")
      .select("*")
      .eq("complaint_id", id)
      .order("created_at", { ascending: false });
    setHistory((historyRows ?? []) as ComplaintHistoryRow[]);

    if (complaintData.duplicate_group_id) {
      const { count } = await supabase
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .eq("duplicate_group_id", complaintData.duplicate_group_id);
      setDuplicateCount(count ?? 1);
    }

    if (complaintData.image_url) {
      const { data: signed } = await supabase.storage.from("complaint-images").createSignedUrl(complaintData.image_url, 3600);
      setImageUrl(signed?.signedUrl ?? null);
    }
    if (complaintData.resolution_image_path) {
      const { data: signed } = await supabase.storage.from("complaint-images").createSignedUrl(complaintData.resolution_image_path, 3600);
      setResolutionImageUrl(signed?.signedUrl ?? null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function nextStatus(): ComplaintStatus | null {
    if (!complaint) return null;
    const idx = STATUS_ORDER.indexOf(complaint.status);
    if (idx === -1 || idx === STATUS_ORDER.length - 1) return null;
    return STATUS_ORDER[idx + 1];
  }

  async function advanceStatus(target: ComplaintStatus) {
    if (!complaint) return;
    if (target === "RESOLVED" && !resolutionNote.trim()) {
      setError("Add a resolution note before marking this complaint resolved.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let resolutionImagePath = complaint.resolution_image_path;
    if (resolutionFile) {
      const ext = resolutionFile.name.split(".").pop() ?? "jpg";
      const path = `resolutions/${complaint.id}/${crypto.randomUUID()}.${ext}`;
      const upload = await supabase.storage.from("complaint-images").upload(path, resolutionFile, { contentType: resolutionFile.type });
      if (upload.error) {
        console.error("[department] resolution upload failed", upload.error);
        setError(`Could not upload the resolution image: ${upload.error.message}`);
        setSaving(false);
        return;
      }
      resolutionImagePath = path;
    }

    const updatePayload: Record<string, unknown> = { status: target };
    if (target === "RESOLVED") {
      updatePayload.resolved_at = new Date().toISOString();
      updatePayload.resolution_note = resolutionNote;
      if (resolutionImagePath) updatePayload.resolution_image_path = resolutionImagePath;
    }

    const { error: updateError } = await supabase.from("complaints").update(updatePayload).eq("id", id);
    if (updateError) {
      console.error("[department] status update failed", updateError);
      setError(`Could not update the status: ${updateError.message}`);
      setSaving(false);
      return;
    }

    await supabase.from("complaint_history").insert({
      complaint_id: id,
      changed_by: user?.id,
      old_status: complaint.status,
      new_status: target,
      note: note.trim() || null,
    });

    await supabase.from("notifications").insert({
      user_id: complaint.user_id,
      title: target === "RESOLVED" ? "Complaint resolved" : "Complaint status updated",
      message:
        target === "RESOLVED"
          ? `Your complaint ${complaint.complaint_code} has been resolved by ${complaint.department ?? "the department"}.`
          : `Your complaint ${complaint.complaint_code} is now ${STATUS_LABELS[target].toLowerCase()}.`,
      type: "STATUS_CHANGE",
    });

    setNote("");
    setResolutionFile(null);
    setSuccess("Status updated.");
    setSaving(false);
    load();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  if (!complaint) {
    return <ErrorBanner message={error ?? "Complaint not found."} />;
  }

  const target = nextStatus();

  return (
    <div>
      <Link href="/department/complaints" className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Assigned Complaints
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{complaint.complaint_code}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{complaint.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDate(complaint.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={complaint.severity} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      {success && <div className="mt-4"><SuccessBanner message={success} /></div>}

      {duplicateCount > 1 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Users2 size={16} /> {duplicateCount} similar complaints detected for this issue.
        </div>
      )}

      {imageUrl && <img src={imageUrl} alt={complaint.title} className="mt-6 max-h-96 w-full rounded-2xl border border-slate-200 object-cover" />}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Category</p>
          <p className="mt-1 font-medium text-slate-900">{complaint.category}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Priority Score</p>
          <p className="mt-1 font-medium text-slate-900">{complaint.priority_score}/100</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400"><MapPin size={12} /> Location</p>
          <p className="mt-1 font-medium text-slate-900">{complaint.address ?? `${complaint.latitude.toFixed(5)}, ${complaint.longitude.toFixed(5)}`}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Description</p>
        <p className="mt-2 whitespace-pre-line text-slate-700">{complaint.description}</p>
      </div>

      {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && target && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">Move to next stage: {STATUS_LABELS[target]}</h3>

          {target === "RESOLVED" && (
            <div className="mt-3 space-y-3">
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Resolution note, e.g. Water pipeline leakage repaired successfully."
              />
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-sky-400 hover:text-sky-600">
                {resolutionFile ? (
                  <span className="text-sm font-medium text-slate-700">{resolutionFile.name}</span>
                ) : (
                  <>
                    <ImagePlus size={24} />
                    <span className="mt-1 text-xs">Upload an after photo (optional)</span>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setResolutionFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            placeholder="Optional note for this status change"
          />

          <button
            onClick={() => advanceStatus(target)}
            disabled={saving}
            className="mt-3 w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : `Mark as ${STATUS_LABELS[target]}`}
          </button>
        </div>
      )}

      {resolutionImageUrl && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Resolution Evidence</p>
          {complaint.resolution_note && <p className="mt-2 text-slate-700">{complaint.resolution_note}</p>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {imageUrl && (
              <div>
                <p className="mb-1 text-xs text-slate-500">Before</p>
                <img src={imageUrl} alt="Before" className="max-h-56 w-full rounded-xl object-cover" />
              </div>
            )}
            <div>
              <p className="mb-1 text-xs text-slate-500">After</p>
              <img src={resolutionImageUrl} alt="After" className="max-h-56 w-full rounded-xl object-cover" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <div className="mt-3 space-y-3">
          {history.length === 0 && <p className="text-sm text-slate-400">No updates yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              {h.old_status !== h.new_status && (
                <p className="font-medium text-slate-800">{h.old_status?.replace("_", " ")} → {h.new_status?.replace("_", " ")}</p>
              )}
              {h.note && <p className="mt-1 text-slate-600">{h.note}</p>}
              <p className="mt-1 text-xs text-slate-400">{formatDate(h.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
