import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function AdminDashboard() {
  const session = await requireRole("MAIN_ADMIN");
  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Main Admin — manage faculties, degrees, users and approved applications."
      />
      <PlaceholderCard>
        Dashboard widgets (pending registrations, approvals, structure
        management) will appear here as features are built.
      </PlaceholderCard>
    </>
  );
}
