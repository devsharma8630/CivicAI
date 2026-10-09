import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "department_staff") redirect("/department/dashboard");
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
