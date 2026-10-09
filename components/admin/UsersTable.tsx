"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import type { Profile, Department } from "@/lib/types";

export function UsersTable() {
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      const [{ data }, { data: deptRows }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("departments").select("*"),
      ]);
      setUsers((data ?? []) as Profile[]);
      setDepartments((deptRows ?? []) as Department[]);
    })();
  }, []);

  async function toggleRole(user: Profile) {
    if (user.id === currentUserId || user.role === "department_staff") return;
    setBusyId(user.id);
    const supabase = createClient();
    const nextRole = user.role === "admin" ? "citizen" : "admin";
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", user.id);
    if (!error) {
      setUsers((prev) => prev && prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
    }
    setBusyId(null);
  }

  function roleLabel(u: Profile) {
    if (u.role !== "department_staff") return u.role;
    const dept = departments.find((d) => d.id === u.department_id);
    return dept ? `staff · ${dept.name}` : "staff";
  }

  if (!users) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{u.full_name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-600">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.role === "admin" ? "bg-indigo-100 text-indigo-700" : u.role === "department_staff" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}`}>
                  {roleLabel(u)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
              <td className="px-4 py-3">
                {u.role === "department_staff" ? (
                  <span className="text-xs text-slate-400">Manage in Departments</span>
                ) : (
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={u.id === currentUserId || busyId === u.id}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    {u.id === currentUserId ? "You" : u.role === "admin" ? "Revoke Admin" : "Make Admin"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
