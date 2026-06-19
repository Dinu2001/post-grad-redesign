import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function Page() {
  await requireRole("SUPERVISOR");
  return (
    <>
      <PageHeader
        title="Progress Reviews"
        subtitle="Review and approve submitted progress reports."
      />
      <PlaceholderCard>
        Progress reports awaiting your review will appear here.
      </PlaceholderCard>
    </>
  );
}
