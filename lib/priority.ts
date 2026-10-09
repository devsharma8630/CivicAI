export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface PriorityInput {
  aiScore: number;
  severity: Severity;
  category: string;
  duplicateCount: number;
  nearbyDensity: number;
  ageHours: number;
}

const SEVERITY_WEIGHT: Record<Severity, number> = { LOW: 4, MEDIUM: 10, HIGH: 18, CRITICAL: 26 };
const SAFETY_CATEGORIES = new Set(["Pothole", "Traffic Signal", "Sewage", "Water Leakage", "Broken Streetlight"]);

export function computePriority(input: PriorityInput): number {
  const safety = SAFETY_CATEGORIES.has(input.category) ? 8 : 0;
  const duplicates = Math.min(12, Math.max(0, input.duplicateCount - 1) * 1.5);
  const density = Math.min(6, input.nearbyDensity * 0.5);
  const age = Math.min(8, input.ageHours / 12);
  const total = input.aiScore * 0.45 + SEVERITY_WEIGHT[input.severity] + safety + duplicates + density + age;
  return Math.round(Math.min(100, Math.max(0, total)));
}

export function priorityBand(score: number): Severity {
  if (score >= 90) return "CRITICAL";
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}
