"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Complaint } from "@/lib/types";

const ComplaintMap = dynamic(() => import("@/components/map/ComplaintMap").then((m) => m.ComplaintMap), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-2xl bg-slate-100" />,
});

export default function DashboardMapPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("complaints").select("*").eq("user_id", user.id);
      setComplaints((data ?? []) as Complaint[]);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Map</h1>
      <p className="mt-1 text-sm text-slate-500">Your reported complaints plotted on the map.</p>

      <div className="mt-6">
        {complaints === null ? (
          <div className="h-[520px] animate-pulse rounded-2xl bg-slate-100" />
        ) : complaints.length === 0 ? (
          <EmptyState icon={MapIcon} title="Nothing to show yet" message="Complaints you report will appear here on the map." actionLabel="Report a Problem" actionHref="/dashboard/report" />
        ) : (
          <ComplaintMap complaints={complaints} linkPrefix="/dashboard/complaints" height="520px" />
        )}
      </div>
    </div>
  );
}
