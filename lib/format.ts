import type { ComplaintStatus, Severity } from "@/lib/types";

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const STATUS_ORDER: ComplaintStatus[] = ["PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function priorityColor(score: number): string {
  if (score >= 90) return "text-red-600";
  if (score >= 75) return "text-orange-600";
  if (score >= 50) return "text-amber-600";
  return "text-slate-600";
}
