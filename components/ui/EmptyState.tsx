import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
        <Icon size={28} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
