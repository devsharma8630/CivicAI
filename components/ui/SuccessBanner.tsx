import { CheckCircle2 } from "lucide-react";

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
