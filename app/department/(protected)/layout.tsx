import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DepartmentSidebar } from "@/components/DepartmentSidebar";

export default async function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/department/login");

  const { data: profile } = await supabase.from("profiles").select("role, department_id").eq("id", user.id).single();
  if (profile?.role === "admin") redirect("/admin/dashboard");
  if (profile?.role !== "department_staff") redirect("/dashboard");

  let departmentName = "Department";
  if (profile.department_id) {
    const { data: department } = await supabase.from("departments").select("name").eq("id", profile.department_id).single();
    departmentName = department?.name ?? "Department";
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DepartmentSidebar departmentName={departmentName} />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
