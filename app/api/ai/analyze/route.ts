import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeImage } from "@/lib/ai";
import { normalizeDepartment } from "@/lib/departments";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "An image is required." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Use a JPG, PNG or WEBP image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 });

  const note = String(form?.get("note") ?? "").slice(0, 1000);
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const analysis = await analyzeImage(`data:${file.type};base64,${base64}`, note);

  const { data: departments } = await supabase.from("departments").select("name");
  const knownDepartments = (departments ?? []).map((d) => d.name as string);
  const normalized = { ...analysis, department: normalizeDepartment(analysis.department, knownDepartments) };

  return NextResponse.json(normalized);
}
