import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "slate" | "emerald" | "amber" | "red" | "indigo";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
