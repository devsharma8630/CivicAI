import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  adminCode: z.string().min(1),
});

const digest = (value: string) => createHash("sha256").update(value).digest();
const denied = () => NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  const secret = process.env.ADMIN_SECRET_CODE;
  if (!parsed.success || !secret) return denied();

  if (!timingSafeEqual(digest(parsed.data.adminCode), digest(secret))) return denied();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return denied();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return denied();
  }
  return NextResponse.json({ redirect: "/admin/dashboard" });
}
