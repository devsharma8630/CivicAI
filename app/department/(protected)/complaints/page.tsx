import { DepartmentComplaintsTable } from "@/components/department/DepartmentComplaintsTable";

export default function DepartmentComplaintsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Assigned Complaints</h1>
      <p className="mt-1 text-sm text-slate-500">Complaints routed to your department.</p>
      <div className="mt-6">
        <DepartmentComplaintsTable />
      </div>
    </div>
  );
}
