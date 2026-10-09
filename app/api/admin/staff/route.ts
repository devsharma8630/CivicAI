import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.string().uuid(),
});

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Please log in to continue.", 401);

  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") return fail("Only administrators can create staff accounts.", 403);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Please provide a valid name, email, password and department.", 400);
  const { fullName, email, password, departmentId } = parsed.data;

  const admin = createAdminClient();

  const { data: department, error: departmentError } = await admin.from("departments").select("id, name").eq("id", departmentId).single();
  if (departmentError || !department) {
    console.error("[admin/staff] department lookup failed", departmentError);
    return fail(`Could not look up that department: ${departmentError?.message ?? "no matching row"}`, 400);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) {
    console.error("[admin/staff] createUser failed", createError);
    return fail(`Could not create the account: ${createError?.message ?? "unknown error"}`, 500);
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ role: "department_staff", department_id: departmentId, full_name: fullName })
    .eq("id", created.user.id);

  if (updateError) {
    console.error("[admin/staff] profile update failed", updateError);
    const { error: insertError } = await admin
      .from("profiles")
      .insert({ id: created.user.id, full_name: fullName, email, role: "department_staff", department_id: departmentId });
    if (insertError) {
      console.error("[admin/staff] profile insert fallback failed", insertError);
      return fail(`Account was created but could not be set up as staff: ${insertError.message}`, 500);
    }
  }

  return NextResponse.json({ id: created.user.id, department: department.name });
}
