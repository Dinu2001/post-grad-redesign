import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function PresentationsPage() {
  await requireRole("REGISTRAR");

  const apps = await prisma.applicationPostGraduate.findMany({
    where: { status: { in: ["ACTIVE", "APPROVED"] } },
    select: {
      id: true,
      status: true,
      fullName: true,
      nic: true,
      degreeProgram: true,
      researchProposals: {
        select: {
          id: true,
          title: true,
          presentations: {
            select: {
              id: true,
              presentationDate: true,
              isDone: true,
              isFinal: true,
            },
            orderBy: { presentationDate: "desc" },
            take: 1,
          },
        },
        take: 1,
      },
    },
    orderBy: { registrationDate: "desc" },
  });

  const withoutPresentation = apps.filter(
    (a) => a.researchProposals[0]?.presentations.length === 0,
  );
  const scheduled = apps.filter(
    (a) => a.researchProposals[0]?.presentations.length > 0 && !a.researchProposals[0]?.presentations[0]?.isDone,
  );
  const completed = apps.filter(
    (a) => a.researchProposals[0]?.presentations.length > 0 && a.researchProposals[0]?.presentations[0]?.isDone && !a.researchProposals[0]?.presentations[0]?.isFinal,
  );

  return (
    <>
      <PageHeader
        title="Presentations"
        subtitle="Manage student presentations and review completion status."
      />

      <div className="space-y-6">
        {/* Presentations Pending Assignment */}
        {withoutPresentation.length > 0 && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-4 text-lg font-bold text-black">
              Pending Presentation Assignment
            </h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Student</th>
                    <th className="px-4 py-2 font-semibold">Degree</th>
                    <th className="px-4 py-2 font-semibold">Proposal</th>
                    <th className="px-4 py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {withoutPresentation.map((app) => (
                    <tr key={app.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium text-black">
                        {app.fullName}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {app.degreeProgram || "—"}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {app.researchProposals[0]?.title || "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/registrar/presentations/assign/${app.id}`}
                          className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                        >
                          Assign Date
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scheduled Presentations */}
        {scheduled.length > 0 && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-4 text-lg font-bold text-black">
              Scheduled Presentations
            </h2>
            <div className="space-y-2">
              {scheduled.map((app) => {
                const presentation = app.researchProposals[0]?.presentations[0];
                if (!presentation) return null;

                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
                  >
                    <div>
                      <p className="font-medium text-black">{app.fullName}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(presentation.presentationDate).toLocaleDateString()} · {app.researchProposals[0]?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        Scheduled
                      </span>
                      <Link
                        href={`/registrar/presentations/${presentation.id}`}
                        className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed presentations awaiting registrar approval */}
        {completed.length > 0 && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-4 text-lg font-bold text-black">
              Completed Presentations Awaiting Approval
            </h2>
            <div className="space-y-2">
              {completed.map((app) => {
                const presentation = app.researchProposals[0]?.presentations[0];
                if (!presentation) return null;

                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
                  >
                    <div>
                      <p className="font-medium text-black">{app.fullName}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(presentation.presentationDate).toLocaleString()} · {app.researchProposals[0]?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        Pending approval
                      </span>
                      <Link
                        href={`/registrar/presentations/${presentation.id}`}
                        className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {apps.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
            No presentations to manage yet.
          </div>
        )}
      </div>
    </>
  );
}
