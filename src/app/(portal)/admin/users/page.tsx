import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ROLE_LABELS } from "@/lib/roles";
import { CreateUserForm } from "./create-user-form";

export default async function UsersPage() {
  await requireRole("MAIN_ADMIN");

  const [users, faculties] = await Promise.all([
    prisma.portalUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.faculty.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Provision staff accounts. Students are created by the Registrar on approval."
      />

      <div className="space-y-6">
        <CreateUserForm faculties={faculties} />

        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-medium text-black">
                    {u.fullName}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
