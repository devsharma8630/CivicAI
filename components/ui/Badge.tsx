"use client";

import { STATUS_COLORS, SEVERITY_COLORS } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ComplaintStatus, Severity } from "@/lib/types";

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${SEVERITY_COLORS[severity]}`}>
      {t(`severity.${severity}`)}
    </span>
  );
}
