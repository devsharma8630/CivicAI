"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  Flame,
  Map,
  BarChart3,
  Users,
  Building2,
  Settings,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const links = [
    { href: "/admin/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/admin/complaints", label: t("nav.allComplaints"), icon: ListChecks },
    { href: "/admin/priority", label: t("nav.priorityQueue"), icon: Flame },
    { href: "/admin/map", label: t("nav.map"), icon: Map },
    { href: "/admin/heatmap", label: t("nav.heatmap"), icon: Flame },
    { href: "/admin/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { href: "/admin/users", label: t("nav.users"), icon: Users },
    { href: "/admin/departments", label: t("nav.departments"), icon: Building2 },
    { href: "/admin/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-emerald-400" size={20} />
          <span className="text-base font-semibold text-white">CivicAI Admin</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-emerald-400" size={22} />
            <div>
              <p className="text-lg font-semibold text-white">CivicAI</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 md:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-4">
          <LanguageSwitcher dark />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-slate-800 text-emerald-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white" />
        </div>
      </aside>
    </>
  );
}
