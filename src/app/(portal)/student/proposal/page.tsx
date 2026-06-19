import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function Page() {
  await requireRole("STUDENT");
  return (
    <>
      <PageHeader
        title="Research Proposal"
        subtitle="Your research proposal and assigned supervisors."
      />
      <PlaceholderCard>
        Proposal details, files and supervisor assignment will appear here.
      </PlaceholderCard>
    </>
  );
}
