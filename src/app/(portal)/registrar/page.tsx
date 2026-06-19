import { requireRole } from "@/lib/guard";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export default async function RegistrarDashboard() {
  const session = await requireRole("REGISTRAR");
  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Registrar — review new registrations, approve or reject, and create student accounts."
      />
      <PlaceholderCard>
        New registration queue and approval tools will appear here.
      </PlaceholderCard>
    </>
  );
}
