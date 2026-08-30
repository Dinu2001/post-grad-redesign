import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function SupervisorDashboard() {
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
    select: {
      id: true,
      title: true,
      application: { select: { fullName: true } },
      supervisors: {
        where: { supervisorId: supervisor.id },
        select: { isMain: true, status: true },
      },
      progressReports: {
        select: {
          id: true,
          title: true,
          submittedAt: true,
          reviews: {
            select: { status: true, reviewedAt: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Supervisor — view assigned students, review progress reports, and manage presentations."
      />
      <div className="mb-4 flex gap-2">
        <Link
          href="/supervisor/presentations"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          View Presentations
        </Link>
      </div>
      <div className="space-y-3">
        {proposals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-sm text-neutral-500">
            No students are assigned to you yet.
          </div>
        ) : (
          proposals.map((proposal) => {
            const selfRole = proposal.supervisors[0];
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
                <div className="mt-3 text-sm text-neutral-600">
                  {proposal.progressReports.length === 0 ? (
                    "No progress report submitted yet."
                  ) : (
                    <ul className="space-y-2">
                      {proposal.progressReports.map((report) => (
                        <li key={report.id} className="rounded border border-border p-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>{report.title}</span>
                            <span className="text-xs text-neutral-500">
                              {new Date(report.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">
                            Review status: {report.reviews.length > 0 ? report.reviews[0].status : "PENDING"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
