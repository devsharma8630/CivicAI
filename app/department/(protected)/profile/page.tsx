import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import type { Profile } from "@/lib/types";

export default async function DepartmentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  let departmentName = "Unassigned";
  if (data?.department_id) {
    const { data: department } = await supabase.from("departments").select("name").eq("id", data.department_id).single();
    departmentName = department?.name ?? "Unassigned";
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Department: {departmentName}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <ProfileForm profile={data as Profile} email={user!.email ?? ""} />
      </div>
    </div>
  );
}
