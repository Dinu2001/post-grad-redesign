import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ApplicationsTable } from "@/components/applications-table";

export default async function Page() {
  await requireRole("FACULTY_ADMIN");
  // Registrar-approved applications awaiting / completed faculty sign-off.
  const rows = await prisma.applicationPostGraduate.findMany({
    where: { status: "APPROVED" },
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
        subtitle="Registrar-approved applications for faculty sign-off."
      />
      <ApplicationsTable
        rows={rows}
        emptyMessage="No applications awaiting faculty review."
      />
    </>
  );
}
