const KEYWORD_MAP: { keywords: string[]; name: string }[] = [
  { keywords: ["fire"], name: "Fire Service" },
  { keywords: ["water", "pipeline", "leak"], name: "Water Supply" },
  { keywords: ["pothole", "road", "street damage", "pavement"], name: "Road Maintenance" },
  { keywords: ["garbage", "trash", "waste", "dumping"], name: "Sanitation" },
  { keywords: ["streetlight", "electric", "power line", "transformer"], name: "Electrical" },
  { keywords: ["sewage", "drain", "sewer"], name: "Sewerage and Drainage" },
  { keywords: ["traffic", "signal", "signage", "congestion"], name: "Traffic Management" },
  { keywords: ["park", "tree", "garden", "horticulture"], name: "Parks & Horticulture" },
  { keywords: ["encroachment", "illegal construction", "property"], name: "Property & Encroachment" },
  { keywords: ["health", "mosquito", "hygiene", "hazard"], name: "Public Health" },
  { keywords: ["emergency"], name: "Emergency Services" },
  { keywords: ["environment"], name: "Environmental Protection and Municipal Waste Management Department" },
];

const FALLBACK_DEPARTMENT = "General Administration";

export function normalizeDepartment(raw: string | null | undefined, knownDepartments: string[]): string {
  const known = new Set(knownDepartments);
  const fallback = known.has(FALLBACK_DEPARTMENT) ? FALLBACK_DEPARTMENT : knownDepartments[0] ?? FALLBACK_DEPARTMENT;
  if (!raw) return fallback;

  const exact = knownDepartments.find((d) => d.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;

  const lower = raw.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((k) => lower.includes(k)) && known.has(entry.name)) {
      return entry.name;
    }
  }

  const partial = knownDepartments.find((d) => lower.includes(d.toLowerCase()) || d.toLowerCase().includes(lower));
  if (partial) return partial;

  return fallback;
}
