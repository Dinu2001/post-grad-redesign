import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard, ChartCard, DonutChart } from "@/components/charts";

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

  const totalStudents = proposals.length;
  const mainCount = proposals.filter((p) => p.supervisors[0]?.isMain).length;
  const allReports = proposals.flatMap((p) => p.progressReports);
  const reviewed = allReports.filter((r) => r.reviews.length > 0).length;
  const pending = allReports.length - reviewed;

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Supervisor — assigned students, progress reviews and presentations."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assigned students"
          value={totalStudents}
          accent="from-indigo-500 to-violet-500"
        />
        <StatCard
          label="As main supervisor"
          value={mainCount}
          accent="from-sky-500 to-cyan-500"
        />
        <StatCard
          label="Reports to review"
          value={pending}
          accent="from-amber-500 to-orange-500"
        />
        <StatCard
          label="Reviewed"
          value={reviewed}
          accent="from-emerald-500 to-teal-500"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Review status"
          subtitle="Progress reports"
          className="lg:col-span-1"
        >
          <DonutChart
            centerLabel="Reports"
            data={[
              { label: "Reviewed", value: reviewed, color: "#10b981" },
              { label: "Pending", value: pending, color: "#f59e0b" },
            ]}
          />
        </ChartCard>

        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            <Link
              href="/supervisor/presentations"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              View presentations
            </Link>
            <Link
              href="/supervisor/reviews"
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-light"
            >
              Progress reviews
            </Link>
          </div>
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <div className="card-shadow rounded-2xl border border-dashed border-border bg-white p-8 text-sm text-neutral-500">
                No students are assigned to you yet.
              </div>
            ) : (
              proposals.map((proposal) => {
                const selfRole = proposal.supervisors[0];
                return (
                  <div
                    key={proposal.id}
                    className="card-shadow rounded-2xl border border-border bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {proposal.application.fullName}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {proposal.title}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          selfRole?.isMain
                            ? "bg-brand-light text-brand-dark"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {selfRole?.isMain ? "Main supervisor" : "Co-supervisor"}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-neutral-600">
                      {proposal.progressReports.length === 0 ? (
                        "No progress report submitted yet."
                      ) : (
                        <ul className="space-y-2">
                          {proposal.progressReports.map((report) => {
                            const status =
                              report.reviews.length > 0
                                ? report.reviews[0].status
                                : "PENDING";
                            const styles: Record<string, string> = {
                              APPROVED: "bg-emerald-100 text-emerald-700",
                              REJECTED: "bg-rose-100 text-rose-700",
                              PENDING: "bg-amber-100 text-amber-700",
                            };
                            return (
                              <li
                                key={report.id}
                                className="rounded-xl border border-border p-2.5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-foreground">
                                    {report.title}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    {new Date(
                                      report.submittedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <span
                                  className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    styles[status] ?? styles.PENDING
                                  }`}
                                >
                                  {status}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
