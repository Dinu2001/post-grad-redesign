import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function Page() {
  await requireRole("STUDENT");
  return (
    <>
      <PageHeader
        title="My Application"
        subtitle="Your submitted registration details and current status."
      />
      <PlaceholderCard>
        Your application summary and status timeline will appear here.
      </PlaceholderCard>
    </>
  );
}
