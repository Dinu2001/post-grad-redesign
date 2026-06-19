import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function AdminRejectedPage() {
  await requireRole("MAIN_ADMIN");

  const apps = await prisma.applicationPostGraduate.findMany({
    where: { status: "REJECTED" },
    orderBy: { registrationDate: "desc" },
    select: {
      id: true,
      fullName: true,
      nic: true,
      faculty: true,
      degreeProgram: true,
      emails: { select: { email: true } },
      contacts: { select: { contactValue: true } },
      declarations: {
        where: { status: "REJECTED" },
        orderBy: { id: "desc" },
        take: 1,
        select: { registrarComment: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Rejected Applications"
        subtitle="Rejected registrations are retained here so you can contact the applicant. Open one for full contact details and the rejection reason."
      />
      {apps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
          No rejected applications.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Applicant</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Phone</th>
                <th className="px-4 py-2 font-semibold">Degree</th>
                <th className="px-4 py-2 font-semibold">Reason</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-2 font-medium text-black">
                    {a.fullName}
                    <div className="text-xs text-neutral-500">{a.nic}</div>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {a.emails[0]?.email ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {a.contacts[0]?.contactValue ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{a.degreeProgram ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-600">
                    <span className="line-clamp-2 max-w-[16rem]">
                      {a.declarations[0]?.registrarComment ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/rejected/${a.id}`}
                      className="rounded-md border border-black px-3 py-1.5 text-xs font-semibold text-black hover:bg-black hover:text-white"
                    >
                      Details
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
