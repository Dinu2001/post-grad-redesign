import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function FacultyAdminDashboard() {
  const session = await requireRole("FACULTY_ADMIN");
  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Faculty Admin — review and sign off registrar-approved applications for your faculty."
      />
      <PlaceholderCard>
        Faculty application queue will appear here.
      </PlaceholderCard>
    </>
  );
}
