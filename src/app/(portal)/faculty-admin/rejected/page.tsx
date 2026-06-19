import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ApplicationsTable } from "@/components/applications-table";

export default async function Page() {
  await requireRole("FACULTY_ADMIN");
  const rows = await prisma.applicationPostGraduate.findMany({
    where: { status: "REJECTED" },
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
        title="Rejected"
        subtitle="Applications rejected by the Registrar."
      />
      <ApplicationsTable rows={rows} emptyMessage="No rejected applications." />
    </>
  );
}
