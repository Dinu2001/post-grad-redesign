import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("REGISTRAR");

  const apps = await prisma.applicationPostGraduate.findMany({
    where: { status: "APPROVED" },
    orderBy: { registrationDate: "desc" },
    select: {
      id: true,
      fullName: true,
      nic: true,
      degreeProgram: true,
      user: {
        select: {
          email: true,
          initialPassword: true,
          mustChangePassword: true,
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Approved"
        subtitle="Applications you have approved. Share each student's login credentials below until they sign in and change their password."
      />
      {apps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
          No approved applications yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Student</th>
                <th className="px-4 py-2 font-semibold">Degree</th>
                <th className="px-4 py-2 font-semibold">Login email</th>
                <th className="px-4 py-2 font-semibold">Temporary password</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const changed = a.user ? !a.user.mustChangePassword : false;
                return (
                  <tr key={a.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-2 font-medium text-black">
                      {a.fullName}
                      <div className="text-xs text-neutral-500">{a.nic}</div>
                    </td>
                    <td className="px-4 py-2 text-neutral-600">
                      {a.degreeProgram ?? "—"}
                    </td>
                    <td className="px-4 py-2 font-mono text-neutral-700">
                      {a.user?.email ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      {changed ? (
                        <span className="rounded border border-black px-2 py-0.5 text-xs font-semibold text-black">
                          Password changed by student
                        </span>
                      ) : a.user?.initialPassword ? (
                        <span className="rounded bg-black px-2 py-0.5 font-mono text-xs font-semibold text-white">
                          {a.user.initialPassword}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/registrar/registrations/${a.id}`}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-black hover:border-black"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
