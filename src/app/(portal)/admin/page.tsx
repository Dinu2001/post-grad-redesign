import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import {
  StatCard,
  ChartCard,
  DonutChart,
  BarChart,
} from "@/components/charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireRole("MAIN_ADMIN");

  const [active, approved, rejected, apps, userCount, supervisorCount] =
    await Promise.all([
      prisma.applicationPostGraduate.count({ where: { status: "ACTIVE" } }),
      prisma.applicationPostGraduate.count({ where: { status: "APPROVED" } }),
      prisma.applicationPostGraduate.count({ where: { status: "REJECTED" } }),
      prisma.applicationPostGraduate.findMany({
        select: { faculty: true, registrationDate: true },
      }),
      prisma.portalUser.count(),
      prisma.supervisorProfile.count(),
    ]);

  const total = active + approved + rejected;

  // Applications per faculty (top 5).
  const byFaculty = new Map<string, number>();
  for (const a of apps) {
    const key = a.faculty?.trim() || "Unassigned";
    byFaculty.set(key, (byFaculty.get(key) ?? 0) + 1);
  }
  const facultyData = [...byFaculty.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  // Registrations over the last 6 months.
  const months: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en", { month: "short" });
    const count = apps.filter((a) => {
      const rd = new Date(a.registrationDate);
      return (
        rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
      );
    }).length;
    months.push({ label, value: count });
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Main Admin — faculties, degrees, users and application overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total applications"
          value={total}
          hint="All statuses"
          accent="from-indigo-500 to-violet-500"
          icon={<IconDoc />}
        />
        <StatCard
          label="Approved"
          value={approved}
          hint="Registrar approved"
          accent="from-emerald-500 to-teal-500"
          icon={<IconCheck />}
        />
        <StatCard
          label="Portal users"
          value={userCount}
          hint="Across all roles"
          accent="from-sky-500 to-cyan-500"
          icon={<IconUsers />}
        />
        <StatCard
          label="Supervisors"
          value={supervisorCount}
          hint="Registered supervisors"
          accent="from-amber-500 to-orange-500"
          icon={<IconStar />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Application status"
          subtitle="Distribution across the pipeline"
        >
          <DonutChart
            centerLabel="Applications"
            data={[
              { label: "Active", value: active, color: "#f59e0b" },
              { label: "Approved", value: approved, color: "#10b981" },
              { label: "Rejected", value: rejected, color: "#f43f5e" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Registrations (last 6 months)"
          subtitle="New applications per month"
        >
          <BarChart data={months} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Applications by faculty" subtitle="Top faculties">
          {facultyData.length ? (
            <BarChart data={facultyData} />
          ) : (
            <p className="py-8 text-center text-sm text-neutral-400">
              No applications yet.
            </p>
          )}
        </ChartCard>

        <ChartCard title="Quick actions" subtitle="Common admin tasks">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/applications", label: "Applications" },
              { href: "/admin/structure", label: "Faculties & Degrees" },
              { href: "/admin/supervisors", label: "Supervisors" },
              { href: "/admin/users", label: "Users" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-xl border border-border bg-brand-light/40 px-4 py-3 text-sm font-semibold text-brand-dark transition hover:bg-brand hover:text-white"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

function IconDoc() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M21 20a5 5 0 0 0-4-4.9" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  );
}
