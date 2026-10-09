"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ListChecks, Hammer, CheckCircle2, User, Building2, Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function DepartmentSidebar({ departmentName }: { departmentName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const links = [
    { href: "/department/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/department/complaints", label: t("nav.assignedComplaints"), icon: ListChecks },
    { href: "/department/complaints?status=IN_PROGRESS", label: t("nav.inProgress"), icon: Hammer },
    { href: "/department/complaints?status=RESOLVED", label: t("nav.resolved"), icon: CheckCircle2 },
    { href: "/department/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Building2 className="text-sky-600" size={20} />
          <span className="text-base font-semibold">{departmentName}</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <Building2 className="text-sky-600" size={22} />
            <div>
              <p className="text-lg font-semibold">CivicAI</p>
              <p className="text-xs font-medium uppercase tracking-wide text-sky-600">{departmentName}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 md:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-4">
          <LanguageSwitcher />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href.split("?")[0] && !href.includes("?");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
