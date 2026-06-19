import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function Page() {
  await requireRole("SUPERVISOR");
  return (
    <>
      <PageHeader
        title="My Students"
        subtitle="Students you supervise as main or co-supervisor."
      />
      <PlaceholderCard>
        Assigned students will appear here once applications are fully approved.
      </PlaceholderCard>
    </>
  );
}
