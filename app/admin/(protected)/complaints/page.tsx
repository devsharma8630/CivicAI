import { AdminComplaintsTable } from "@/components/admin/AdminComplaintsTable";

export default function AdminComplaintsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">All Complaints</h1>
      <p className="mt-1 text-sm text-slate-500">Search, filter and manage every citizen report.</p>
      <div className="mt-6">
        <AdminComplaintsTable />
      </div>
    </div>
  );
}
