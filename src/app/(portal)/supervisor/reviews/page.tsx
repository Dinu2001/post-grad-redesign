import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ReviewForm } from "../review-form";

export default async function Page() {
  const session = await requireRole("SUPERVISOR");
  const supervisor = await prisma.supervisorProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!supervisor) {
    return null;
  }

  const reports = await prisma.progressReport.findMany({
    where: {
      proposal: {
        supervisors: { some: { supervisorId: supervisor.id } },
      },
    },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      submittedAt: true,
      proposal: {
        select: {
          title: true,
          application: { select: { fullName: true } },
        },
      },
      files: { select: { originalFileName: true, filePath: true } },
      reviews: {
        where: { supervisorId: supervisor.id },
        select: { status: true, comment: true, reviewedAt: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Progress Reviews"
        subtitle="Review and approve submitted progress reports."
      />
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-sm text-neutral-500">
            No submitted reports are available for review yet.
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="rounded-lg border border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-black">{report.proposal.application.fullName}</p>
                  <p className="text-sm text-neutral-600">{report.proposal.title}</p>
                </div>
                <span className="rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">
                  {report.reviews[0]?.status ?? "PENDING"}
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{report.title}</p>
              {report.description && (
                <p className="mt-1 text-sm text-neutral-500">{report.description}</p>
              )}
              {report.files[0] && (
                <a
                  href={`/api/files?path=${encodeURIComponent(report.files[0].filePath)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-black underline"
                >
                  Download report ({report.files[0].originalFileName})
                </a>
              )}
              <ReviewForm
                progressId={report.id}
                initialComment={report.reviews[0]?.comment ?? null}
                initialStatus={report.reviews[0]?.status}
                reviewedAt={report.reviews[0]?.reviewedAt}
              />
            </div>
          ))
        )}
      </div>
    </>
  );
}
