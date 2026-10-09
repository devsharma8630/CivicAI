"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Loader2, KeyRound } from "lucide-react";
import { friendlyAuthError } from "@/lib/errors";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, adminCode }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(friendlyAuthError(body?.error) ?? "Invalid admin credentials.");
        setLoading(false);
        return;
      }
      router.push(body.redirect ?? "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <ShieldAlert className="text-emerald-400" size={24} />
          <div>
            <p className="text-xl font-semibold text-white">CivicAI</p>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Administrator Portal</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-white">Restricted access</h1>
        <p className="mt-1 text-sm text-slate-400">This area is for authorized municipal staff only.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="block text-sm font-medium text-slate-300" htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="admin@civicai.gov"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300" htmlFor="adminCode">
              <KeyRound size={14} /> Admin Secret Code
            </label>
            <input
              id="adminCode"
              type="password"
              required
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Provided by your administrator"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Verifying..." : "Access Admin Portal"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Not an administrator? <Link href="/login" className="text-emerald-400 hover:underline">Go to citizen login</Link>
        </p>
      </div>
    </main>
  );
}
