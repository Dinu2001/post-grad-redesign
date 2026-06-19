import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function SupervisorDashboard() {
  const session = await requireRole("SUPERVISOR");
  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Supervisor — view assigned students and review their progress reports."
      />
      <PlaceholderCard>
        Students you supervise (as main or co-supervisor) and their progress
        reviews will appear here.
      </PlaceholderCard>
    </>
  );
}
