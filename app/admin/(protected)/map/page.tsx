"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Complaint } from "@/lib/types";

const ComplaintMap = dynamic(() => import("@/components/map/ComplaintMap").then((m) => m.ComplaintMap), {
  ssr: false,
  loading: () => <div className="h-[600px] animate-pulse rounded-2xl bg-slate-100" />,
});

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("complaints").select("*").then(({ data }) => setComplaints((data ?? []) as Complaint[]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Complaint Map</h1>
      <p className="mt-1 text-sm text-slate-500">All citizen-reported complaints across the city.</p>
      <div className="mt-6">
        {complaints === null ? (
          <div className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : (
          <ComplaintMap complaints={complaints} linkPrefix="/admin/complaints" height="600px" />
        )}
      </div>
    </div>
  );
}
