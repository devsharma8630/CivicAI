import { z } from "zod";
import { IMAGE_ANALYSIS_PROMPT } from "@/lib/ai/prompts";

export const CATEGORIES = [
  "Pothole", "Garbage", "Broken Streetlight", "Water Leakage", "Sewage", "Road Damage",
  "Traffic Signal", "Drainage", "Public Property Damage", "Illegal Dumping", "Other",
] as const;

const analysisSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(1000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  priority_score: z.number().min(0).max(100),
  department: z.string().min(2).max(120),
  impact: z.string().min(2).max(500),
  confidence: z.number().min(0).max(1),
});

export type ImageAnalysis = z.infer<typeof analysisSchema> & { analyzed: boolean };

const fallback: ImageAnalysis = {
  category: "Other",
  title: "Civic issue reported",
  description: "Unable to confidently identify the problem. Manual review required.",
  severity: "MEDIUM",
  priority_score: 50,
  department: "General Administration",
  impact: "Requires manual review by an administrator.",
  confidence: 0,
  analyzed: false,
};

export async function analyzeImage(imageDataUrl: string, note: string): Promise<ImageAnalysis> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) return fallback;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: IMAGE_ANALYSIS_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: note ? `Citizen note: ${note}` : "No citizen note provided." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    const raw: string = json.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = analysisSchema.parse(JSON.parse(cleaned));
    return { ...parsed, analyzed: true };
  } catch {
    return fallback;
  }
}
