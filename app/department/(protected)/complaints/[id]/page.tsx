import { DepartmentComplaintDetail } from "@/components/department/DepartmentComplaintDetail";

export default async function DepartmentComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <DepartmentComplaintDetail id={id} />
    </div>
  );
}
