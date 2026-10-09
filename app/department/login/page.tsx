"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/errors";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default function DepartmentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !data.user) {
        setError(friendlyAuthError(signInError?.message));
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile?.role !== "department_staff") {
        await supabase.auth.signOut();
        setError("This login is for department staff accounts only.");
        setLoading(false);
        return;
      }
      router.push("/department/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-sky-900 bg-sky-900/40 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="text-sky-300" size={24} />
          <div>
            <p className="text-xl font-semibold text-white">CivicAI</p>
            <p className="text-xs font-medium uppercase tracking-widest text-sky-300">Department Staff Portal</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-white">Staff login</h1>
        <p className="mt-1 text-sm text-sky-200">Access complaints assigned to your department.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="block text-sm font-medium text-sky-100" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sky-800 bg-sky-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              placeholder="staff@civicai.gov"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-100" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sky-800 bg-sky-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-sky-950 hover:bg-sky-300 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-sky-300">
          <Link href="/login" className="hover:underline">Citizen login</Link> · <Link href="/admin/login" className="hover:underline">Admin login</Link>
        </p>
      </div>
    </main>
  );
}
