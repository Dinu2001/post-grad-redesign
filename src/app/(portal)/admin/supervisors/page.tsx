import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SupervisorManager, type SupervisorRow } from "./manager";

export const dynamic = "force-dynamic";

export default async function SupervisorsPage() {
  await requireRole("MAIN_ADMIN");

  const supervisors = await prisma.supervisorProfile.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      title: true,
      university: true,
      telephone: true,
      userId: true,
      _count: { select: { proposals: true } },
    },
  });

  const rows: SupervisorRow[] = supervisors.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    university: s.university,
    telephone: s.telephone,
    hasAccount: s.userId != null,
    usageCount: s._count.proposals,
  }));

  return (
    <>
      <PageHeader
        title="Supervisors"
        subtitle="Maintain the list of supervisors students can select in the research-proposal step of registration."
      />
      <SupervisorManager supervisors={rows} />
    </>
  );
}
