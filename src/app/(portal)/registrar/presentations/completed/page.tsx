import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function CompletedPresentationsPage() {
  await requireRole("REGISTRAR");

  const presentations = await prisma.presentation.findMany({
    where: { isDone: true },
    select: {
      id: true,
      title: true,
      presentationDate: true,
      isFinal: true,
      proposal: {
        select: {
          title: true,
          application: {
            select: {
              fullName: true,
              degreeProgram: true,
            },
          },
        },
      },
    },
    orderBy: { presentationDate: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Completed Presentations"
        subtitle="Open completed presentation records to review the student, proposal and presentation outcome."
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          href="/registrar/approved"
          className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          View approved students
        </Link>
        <Link
          href="/registrar/presentations"
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-black hover:border-brand"
        >
          Pending presentations
        </Link>
      </div>

      {presentations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
          No completed presentations yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Student</th>
                <th className="px-4 py-2 font-semibold">Presentation</th>
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {presentations.map((presentation) => (
                <tr
                  key={presentation.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">
                      {presentation.proposal.application.fullName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {presentation.proposal.application.degreeProgram || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {presentation.title || presentation.proposal.title}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(presentation.presentationDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        presentation.isFinal
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {presentation.isFinal ? "Approved" : "Awaiting approval"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/registrar/presentations/${presentation.id}`}
                      className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                    >
                      View presentation
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}