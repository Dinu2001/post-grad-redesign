import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ApplicationsTable } from "@/components/applications-table";

export default async function AdminApplicationsPage() {
  await requireRole("MAIN_ADMIN");

  const applications = await prisma.applicationPostGraduate.findMany({
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
      researchProposals: {
        select: {
          id: true,
          title: true,
          files: { select: { id: true } },
          supervisors: {
            select: {
              id: true,
              isMain: true,
              supervisor: { select: { name: true } },
              cvDocument: true,
              consentDocument: true,
            },
          },
        },
      },
    },
  });

  const rows = applications.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    nic: a.nic,
    faculty: a.faculty,
    degreeProgram: a.degreeProgram,
    status: a.status,
    registrationDate: a.registrationDate,
  }));

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="All active and approved postgraduate applications."
      />
      <ApplicationsTable
        rows={rows}
        emptyMessage="No applications yet. They will appear here once students register."
        showDetailLink={true}
      />
    </>
  );
}
