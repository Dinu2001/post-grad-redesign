import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ApplicationsTable } from "@/components/applications-table";

export default async function AdminApplicationsPage() {
  await requireRole("MAIN_ADMIN");

  const rows = await prisma.applicationPostGraduate.findMany({
    where: { status: { in: ["ACTIVE", "APPROVED"] } },
    orderBy: { registrationDate: "desc" },
    select: {
      id: true,
      fullName: true,
      nic: true,
      faculty: true,
      degreeProgram: true,
      status: true,
      registrationDate: true,
    },
  });

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="All active and approved postgraduate applications."
      />
      <ApplicationsTable
        rows={rows}
        emptyMessage="No applications yet. They will appear here once students register."
      />
    </>
  );
}
