import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("REGISTRAR");

  // New registrations awaiting the registrar's decision = status ACTIVE.
  const apps = await prisma.applicationPostGraduate.findMany({
    where: { status: "ACTIVE" },
    orderBy: { registrationDate: "asc" },
    select: {
      id: true,
      fullName: true,
      nic: true,
      faculty: true,
      degreeProgram: true,
      registrationDate: true,
    },
  });

  return (
    <>
      <PageHeader
        title="New Registrations"
        subtitle="Applications awaiting your review. Open one to approve or reject."
      />
      {apps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
          No new registrations to review.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Applicant</th>
                <th className="px-4 py-2 font-semibold">NIC</th>
                <th className="px-4 py-2 font-semibold">Faculty</th>
                <th className="px-4 py-2 font-semibold">Degree</th>
                <th className="px-4 py-2 font-semibold">Submitted</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-medium text-black">{a.fullName}</td>
                  <td className="px-4 py-2 text-neutral-600">{a.nic}</td>
                  <td className="px-4 py-2 text-neutral-600">{a.faculty ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-600">{a.degreeProgram ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-600">
                    {a.registrationDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/registrar/registrations/${a.id}`}
                      className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                    >
                      Review
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
