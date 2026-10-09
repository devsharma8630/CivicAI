import { AdminComplaintDetail } from "@/components/admin/AdminComplaintDetail";

export default async function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <AdminComplaintDetail id={id} />
    </div>
  );
}
