"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SuccessBanner } from "@/components/ui/SuccessBanner";
import type { Department, Complaint, Profile } from "@/lib/types";

interface DeptStats {
  staff: number;
  assigned: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

export function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [stats, setStats] = useState<Record<string, DeptStats>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffDepartmentId, setStaffDepartmentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const [{ data: deptRows }, { data: profileRows }, { data: complaintRows }] = await Promise.all([
      supabase.from("departments").select("*").order("name"),
      supabase.from("profiles").select("*").eq("role", "department_staff"),
      supabase.from("complaints").select("*"),
    ]);
    const depts = (deptRows ?? []) as Department[];
    const staffProfiles = (profileRows ?? []) as Profile[];
    const complaints = (complaintRows ?? []) as Complaint[];

    const next: Record<string, DeptStats> = {};
    for (const d of depts) {
      const staffCount = staffProfiles.filter((p) => p.department_id === d.id).length;
      const deptComplaints = complaints.filter((c) => c.department === d.name);
      next[d.id] = {
        staff: staffCount,
        assigned: deptComplaints.length,
        pending: deptComplaints.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW" || c.status === "ASSIGNED").length,
        inProgress: deptComplaints.filter((c) => c.status === "IN_PROGRESS").length,
        resolved: deptComplaints.filter((c) => c.status === "RESOLVED").length,
      };
    }
    setStats(next);
    setDepartments(depts);
    if (!staffDepartmentId && depts.length > 0) setStaffDepartmentId(depts[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const totalStaff = useMemo(() => Object.values(stats).reduce((sum, s) => sum + s.staff, 0), [stats]);

  function startEdit(d: Department) {
    setEditingId(d.id);
    setName(d.name);
    setDescription(d.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  async function saveDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = { name: name.trim(), description: description.trim() || null };
    const { error: saveError } = editingId
      ? await supabase.from("departments").update(payload).eq("id", editingId)
      : await supabase.from("departments").insert(payload);
    setSaving(false);
    if (saveError) {
      console.error("[departments] save failed", saveError);
      setError(`Could not save the department: ${saveError.message}`);
      return;
    }
    cancelEdit();
    load();
  }

  async function deleteDepartment(d: Department) {
    const dStats = stats[d.id];
    if (dStats && (dStats.staff > 0 || dStats.assigned > 0)) {
      setError(`Cannot delete ${d.name}: it still has ${dStats.staff} staff member(s) or ${dStats.assigned} complaint(s) assigned.`);
      return;
    }
    if (!confirm(`Delete ${d.name}? This cannot be undone.`)) return;
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("departments").delete().eq("id", d.id);
    if (deleteError) {
      console.error("[departments] delete failed", deleteError);
      setError(`Could not delete the department: ${deleteError.message}`);
      return;
    }
    load();
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || staffPassword.length < 6 || !staffDepartmentId) return;
    setStaffSaving(true);
    setStaffError(null);
    setStaffSuccess(null);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: staffName, email: staffEmail, password: staffPassword, departmentId: staffDepartmentId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStaffError(body?.error ?? "Could not create the staff account.");
        setStaffSaving(false);
        return;
      }
      setStaffSuccess(`Staff account created for ${body.department}.`);
      setStaffName("");
      setStaffEmail("");
      setStaffPassword("");
      setStaffSaving(false);
      load();
    } catch {
      setStaffError("Could not reach the server. Check your connection and try again.");
      setStaffSaving(false);
    }
  }

  if (!departments) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">In Progress</th>
                <th className="px-4 py-3">Resolved</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => {
                const s = stats[d.id] ?? { staff: 0, assigned: 0, pending: 0, inProgress: 0, resolved: 0 };
                return (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.description ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.staff}</td>
                    <td className="px-4 py-3 text-slate-600">{s.assigned}</td>
                    <td className="px-4 py-3 text-slate-600">{s.pending}</td>
                    <td className="px-4 py-3 text-slate-600">{s.inProgress}</td>
                    <td className="px-4 py-3 text-slate-600">{s.resolved}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(d)} className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteDepartment(d)} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <form onSubmit={saveDepartment} className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-700">{editingId ? "Edit Department" : "Add Department"}</h3>
          {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Department name"
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Plus size={16} /> {editingId ? "Save Changes" : "Add Department"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UserPlus size={16} /> Create Department Staff Account ({totalStaff} total)
        </h3>
        {staffError && <div className="mt-3"><ErrorBanner message={staffError} /></div>}
        {staffSuccess && <div className="mt-3"><SuccessBanner message={staffSuccess} /></div>}
        <form onSubmit={createStaff} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Full name" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          <input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} type="email" placeholder="Email" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          <input value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} type="password" placeholder="Password" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          <select value={staffDepartmentId} onChange={(e) => setStaffDepartmentId(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={staffSaving || !staffName.trim() || !staffEmail.trim() || staffPassword.length < 6}
            className="sm:col-span-2 lg:col-span-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {staffSaving && <Loader2 size={16} className="animate-spin" />} Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
