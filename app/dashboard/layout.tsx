import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "admin") redirect("/admin/dashboard");
  if (profile?.role === "department_staff") redirect("/department/dashboard");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
