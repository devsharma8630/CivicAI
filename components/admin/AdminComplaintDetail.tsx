"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import { formatDate } from "@/lib/format";
import type { Complaint, ComplaintHistoryRow, ComplaintAIAnalysis, Department, ComplaintStatus, Profile } from "@/lib/types";

const STATUSES: ComplaintStatus[] = ["PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export function AdminComplaintDetail({ id }: { id: string }) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [reporter, setReporter] = useState<Profile | null>(null);
  const [updates, setUpdates] = useState<ComplaintHistoryRow[]>([]);
  const [analysis, setAnalysis] = useState<ComplaintAIAnalysis | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusChoice, setStatusChoice] = useState<ComplaintStatus>("PENDING");
  const [departmentChoice, setDepartmentChoice] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: c, error: complaintError } = await supabase.from("complaints").select("*").eq("id", id).single();
    if (complaintError || !c) {
      setError("Complaint not found.");
      setLoading(false);
      return;
    }
    const complaintData = c as Complaint;
    setComplaint(complaintData);
    setStatusChoice(complaintData.status);
    setDepartmentChoice(complaintData.department ?? "");

    const [{ data: profile }, { data: updateRows }, { data: analysisRows }, { data: deptRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", complaintData.user_id).single(),
      supabase.from("complaint_history").select("*").eq("complaint_id", id).order("created_at", { ascending: false }),
      supabase.from("complaint_ai_analysis").select("*").eq("complaint_id", id).order("created_at", { ascending: false }).limit(1),
      supabase.from("departments").select("*").order("name"),
    ]);
    setReporter((profile as Profile) ?? null);
    setUpdates((updateRows ?? []) as ComplaintHistoryRow[]);
    setAnalysis((analysisRows?.[0] as ComplaintAIAnalysis) ?? null);
    setDepartments((deptRows ?? []) as Department[]);

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
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function logAction(action: string, details: Record<string, unknown>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_actions").insert({ admin_id: user.id, complaint_id: id, action, details });
  }

  async function applyStatus() {
    if (!complaint) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedAt = statusChoice === "RESOLVED" ? new Date().toISOString() : complaint.resolved_at;
    const { error: updateError } = await supabase.from("complaints").update({ status: statusChoice, resolved_at: resolvedAt }).eq("id", id);
    if (updateError) {
      console.error("[admin] status update failed", updateError);
      setError(`Could not update the status: ${updateError.message}`);
      setSaving(false);
      return;
    }
    await supabase.from("complaint_history").insert({
      complaint_id: id,
      changed_by: user?.id,
      old_status: complaint.status,
      new_status: statusChoice,
      note: null,
    });
    await supabase.from("notifications").insert({
      user_id: complaint.user_id,
      title: "Complaint status updated",
      message: `Your complaint ${complaint.complaint_code} is now ${statusChoice.replace("_", " ").toLowerCase()}.`,
      type: "STATUS_CHANGE",
    });
    await logAction("STATUS_CHANGE", { from: complaint.status, to: statusChoice });
    setSuccess("Status updated.");
    setSaving(false);
    load();
  }

  async function applyDepartment() {
    if (!departmentChoice) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("complaints").update({ department: departmentChoice }).eq("id", id);
    if (updateError) {
      console.error("[admin] department assign failed", updateError);
      setError(`Could not assign the department: ${updateError.message}`);
      setSaving(false);
      return;
    }
    await logAction("DEPARTMENT_ASSIGNED", { department: departmentChoice });
    setSuccess("Department assigned.");
    setSaving(false);
    load();
  }

  async function addNote() {
    if (!note.trim() || !complaint) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("complaint_history").insert({
      complaint_id: id,
      changed_by: user?.id,
      old_status: complaint.status,
      new_status: complaint.status,
      note,
    });
    if (insertError) {
      console.error("[admin] add note failed", insertError);
      setError(`Could not add the note: ${insertError.message}`);
      setSaving(false);
      return;
    }
    await logAction("NOTE_ADDED", { note });
    setNote("");
    setSuccess("Note added.");
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

  return (
    <div>
      <Link href="/admin/complaints" className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to All Complaints
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{complaint.complaint_code}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{complaint.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Reported by {reporter?.full_name ?? reporter?.email ?? "Unknown"} · {formatDate(complaint.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={complaint.severity} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      {success && <div className="mt-4"><SuccessBanner message={success} /></div>}

      {complaint.is_suspicious && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Flagged as potentially suspicious (spam score {complaint.spam_score}/100). Review carefully before acting.
        </div>
      )}
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
          <p className="text-xs uppercase tracking-wide text-slate-400">AI Priority Score</p>
          <p className="mt-1 font-medium text-slate-900">{complaint.priority_score}/100</p>
          <p className="mt-1 text-xs text-slate-400">Decision support only — not automatic</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400"><MapPin size={12} /> Location</p>
          <p className="mt-1 font-medium text-slate-900">{complaint.address ?? `${complaint.latitude.toFixed(5)}, ${complaint.longitude.toFixed(5)}`}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Description</p>
        <p className="mt-2 whitespace-pre-line text-slate-700">{complaint.description}</p>
        {analysis && (
          <p className="mt-3 text-xs text-slate-400">
            AI confidence {Math.round((analysis.confidence ?? 0) * 100)}% · Original AI category: {analysis.category} · Original AI severity: {analysis.severity}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">Change Status</h3>
          <select
            value={statusChoice}
            onChange={(e) => setStatusChoice(e.target.value as ComplaintStatus)}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <button
            onClick={applyStatus}
            disabled={saving || statusChoice === complaint.status}
            className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Update Status
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">Assign Department</h3>
          <select
            value={departmentChoice}
            onChange={(e) => setDepartmentChoice(e.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="">Select a department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={applyDepartment}
            disabled={saving || !departmentChoice || departmentChoice === complaint.department}
            className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Assign Department
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700">Add Admin Note</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          placeholder="Add context for this complaint's history"
        />
        <button onClick={addNote} disabled={saving || !note.trim()} className="mt-3 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Add Note
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <div className="mt-3 space-y-3">
          {updates.length === 0 && <p className="text-sm text-slate-400">No updates yet.</p>}
          {updates.map((u) => (
            <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              {u.old_status !== u.new_status && (
                <p className="font-medium text-slate-800">{u.old_status?.replace("_", " ")} → {u.new_status?.replace("_", " ")}</p>
              )}
              {u.note && <p className="mt-1 text-slate-600">{u.note}</p>}
              <p className="mt-1 text-xs text-slate-400">{formatDate(u.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
