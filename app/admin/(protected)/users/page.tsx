import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-500">Manage citizen and administrator accounts.</p>
      <div className="mt-6"><UsersTable /></div>
    </div>
  );
}
