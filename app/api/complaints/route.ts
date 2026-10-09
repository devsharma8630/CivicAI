import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeImage } from "@/lib/ai";
import { computePriority, priorityBand } from "@/lib/priority";
import { normalizeDepartment } from "@/lib/departments";

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;
const RADIUS_DEGREES = 0.0005;
const WINDOW_DAYS = 30;
const DB_SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;

function toDbSeverity(severity: string): (typeof DB_SEVERITIES)[number] {
  return severity === "CRITICAL" ? "HIGH" : (DB_SEVERITIES as readonly string[]).includes(severity) ? (severity as (typeof DB_SEVERITIES)[number]) : "MEDIUM";
}

const inputSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  note: z.string().max(1000),
  address: z.string().max(300).optional(),
});

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Please log in to continue.", 401);

  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return fail("Could not load complaints.", 500);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Please log in to continue.", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!form || !(file instanceof File)) return fail("An image is required.", 400);
  if (!EXTENSIONS[file.type]) return fail("Use a JPG, PNG or WEBP image.", 400);
  if (file.size > MAX_BYTES) return fail("Image must be under 5 MB.", 400);

  const input = inputSchema.safeParse({
    latitude: form.get("latitude"),
    longitude: form.get("longitude"),
    note: String(form.get("note") ?? ""),
    address: form.get("address") ? String(form.get("address")) : undefined,
  });
  if (!input.success) return fail("A valid location is required.", 400);
  const { latitude, longitude, note, address } = input.data;

  const buffer = Buffer.from(await file.arrayBuffer());
  const analysis = await analyzeImage(`data:${file.type};base64,${buffer.toString("base64")}`, note);

  const { data: departmentRows } = await supabase.from("departments").select("name");
  const knownDepartments = (departmentRows ?? []).map((d) => d.name as string);
  const department = normalizeDepartment(analysis.department, knownDepartments);

  const path = `${user.id}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const upload = await supabase.storage.from("complaint-images").upload(path, buffer, { contentType: file.type });
  if (upload.error) {
    console.error("[complaints] storage upload failed", upload.error);
    return fail(`Image upload failed: ${upload.error.message}`, 500);
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
  const { data: nearby } = await admin
    .from("complaints")
    .select("id, duplicate_group_id")
    .eq("category", analysis.category)
    .neq("status", "REJECTED")
    .gte("created_at", since)
    .gte("latitude", latitude - RADIUS_DEGREES)
    .lte("latitude", latitude + RADIUS_DEGREES)
    .gte("longitude", longitude - RADIUS_DEGREES)
    .lte("longitude", longitude + RADIUS_DEGREES);

  const matches = nearby ?? [];
  const existingGroup = matches.find((m) => m.duplicate_group_id)?.duplicate_group_id ?? null;
  const groupId: string | null = existingGroup ?? (matches.length > 0 ? crypto.randomUUID() : null);

  const score = computePriority({
    aiScore: analysis.priority_score,
    severity: analysis.severity,
    category: analysis.category,
    duplicateCount: matches.length + 1,
    nearbyDensity: matches.length,
    ageHours: 0,
  });

  const { data: complaint, error } = await supabase
    .from("complaints")
    .insert({
      user_id: user.id,
      title: analysis.title,
      description: note ? `${analysis.description}\n\nCitizen note: ${note}` : analysis.description,
      category: analysis.category,
      severity: toDbSeverity(analysis.severity),
      priority_score: score,
      department,
      latitude,
      longitude,
      address,
      image_url: path,
      ai_confidence: Number(analysis.confidence.toFixed(2)),
      duplicate_group_id: groupId,
    })
    .select("id, complaint_code")
    .single();
  if (error || !complaint) {
    console.error("[complaints] insert failed", { error, user_id: user.id, category: analysis.category, severity: analysis.severity });
    await supabase.storage.from("complaint-images").remove([path]);
    return fail(`Could not save your complaint: ${error?.message ?? "unknown error"}${error?.hint ? ` (${error.hint})` : ""}`, 500);
  }

  const ungrouped = matches.filter((m) => !m.duplicate_group_id).map((m) => m.id);
  if (groupId && ungrouped.length > 0) {
    await admin.from("complaints").update({ duplicate_group_id: groupId }).in("id", ungrouped);
  }

  await supabase.from("complaint_ai_analysis").insert({
    complaint_id: complaint.id,
    category: analysis.category,
    severity: analysis.severity,
    priority_score: analysis.priority_score,
    department: analysis.department,
    impact: analysis.impact,
    confidence: Number(analysis.confidence.toFixed(2)),
    ai_description: analysis.description,
  });

  const notices = [
    { user_id: user.id, title: "Complaint submitted", message: `Your complaint ${complaint.complaint_code} was received.`, type: "COMPLAINT_SUBMITTED" },
  ];
  const band = priorityBand(score);
  const alertAdmins = band === "HIGH" || band === "CRITICAL" || matches.length >= 4;
  if (alertAdmins) {
    const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
    for (const a of admins ?? []) {
      notices.push({
        user_id: a.id,
        title: band === "CRITICAL" ? "Critical complaint" : "High-priority complaint",
        message: `${complaint.complaint_code}: ${analysis.title} (priority ${score}, ${matches.length + 1} similar reports).`,
        type: "ADMIN_ALERT",
      });
    }
  }
  await admin.from("notifications").insert(notices);

  return NextResponse.json({
    id: complaint.id,
    complaint_number: complaint.complaint_code,
    priority_score: score,
    duplicate_count: matches.length + 1,
    ai_analyzed: analysis.analyzed,
  });
}
