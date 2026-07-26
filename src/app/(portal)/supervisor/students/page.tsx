import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function Page() {
  const session = await requireRole("SUPERVISOR");
  const supervisor = await prisma.supervisorProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!supervisor) {
    return null;
  }

  const proposals = await prisma.researchProposal.findMany({
    where: {
      supervisors: { some: { supervisorId: supervisor.id } },
    },
    orderBy: { submittedDate: "desc" },
    select: {
      id: true,
      title: true,
      application: { select: { fullName: true } },
      supervisors: {
        where: { supervisorId: supervisor.id },
        select: { isMain: true, status: true },
      },
      files: { select: { fileName: true, filePath: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="My Students"
        subtitle="Students you supervise as main or co-supervisor."
      />
      <div className="space-y-3">
        {proposals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-sm text-neutral-500">
            No assigned students yet.
          </div>
        ) : (
          proposals.map((proposal) => {
            const selfRole = proposal.supervisors[0];
            const proposalFile = proposal.files[0];
            return (
              <div key={proposal.id} className="rounded-lg border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-black">{proposal.application.fullName}</p>
                    <p className="text-sm text-neutral-600">{proposal.title}</p>
                  </div>
                  <span className="rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">
                    {selfRole?.isMain ? "Main supervisor" : "Co-supervisor"}
                  </span>
                </div>
                {proposalFile && (
                  <div className="mt-3 text-sm">
                    <a
                      href={`/api/files?path=${encodeURIComponent(proposalFile.filePath)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-black underline"
                    >
                      Download proposal ({proposalFile.fileName})
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
