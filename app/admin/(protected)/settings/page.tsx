import { createClient } from "@/lib/supabase/server";
import { Sparkles, Bell, ShieldAlert } from "lucide-react";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Your account and platform configuration.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Administrator Account</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
            <p className="mt-1 font-medium text-slate-900">{profile?.full_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-1 font-medium text-slate-900">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-500">
          <Sparkles size={16} />
          <h2 className="text-sm font-semibold">AI Configuration</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          The AI model, priority weighting and spam thresholds are configured via environment variables
          (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">OPENROUTER_MODEL</code>) on the server. An in-app editor for these is not available yet.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-500">
          <Bell size={16} />
          <h2 className="text-sm font-semibold">Notification Preferences</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">Coming soon — per-admin notification preferences are not yet configurable.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldAlert size={16} />
          <h2 className="text-sm font-semibold">Admin Secret Code</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          The admin secret code is set via the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_SECRET_CODE</code> server environment variable and is never exposed here.
        </p>
      </div>
    </div>
  );
}
