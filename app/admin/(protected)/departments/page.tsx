import { DepartmentsManager } from "@/components/admin/DepartmentsManager";

export default function AdminDepartmentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Departments</h1>
      <p className="mt-1 text-sm text-slate-500">Municipal departments complaints can be routed to.</p>
      <div className="mt-6"><DepartmentsManager /></div>
    </div>
  );
}
