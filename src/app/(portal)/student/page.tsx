import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { getStudentApplication } from "@/lib/student";
import { progressSchedule, windowStatus } from "@/lib/progress";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export const dynamic = "force-dynamic";

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-neutral-500">{k}</span>
      <span className="text-right font-medium text-black">{v || "—"}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-2 text-base font-bold text-black">{title}</h3>
      {children}
    </div>
  );
}

export default async function StudentDashboard() {
  const session = await requireRole("STUDENT");
  const app = await getStudentApplication(session.userId);

  if (!app) {
    return (
      <>
        <PageHeader
          title={`Welcome, ${session.fullName}`}
          subtitle="Student dashboard"
        />
        <PlaceholderCard>
          Your approved application details are not available yet.
        </PlaceholderCard>
      </>
    );
  }

  const proposal = app.researchProposals[0];
  const level = proposal?.degreeSought.level ?? "OTHER";
  const schedule = progressSchedule(level, app.studyMode, app.programStartYear);

  const submittedKeys = new Set(
    (proposal?.progressReports ?? [])
      .map((r) => r.periodKey)
      .filter((k): k is string => Boolean(k)),
  );
  const now = new Date();
  const submittedCount = schedule.filter((w) =>
    submittedKeys.has(w.periodKey),
  ).length;
  const openNow = schedule.filter(
    (w) => windowStatus(w, now, submittedKeys) === "open",
  );
  const main = proposal?.supervisors.find((s) => s.isMain)?.supervisor;
  const co = (proposal?.supervisors ?? []).filter((s) => !s.isMain);

  return (
    <>
      <PageHeader
        title={`Welcome, ${session.fullName}`}
        subtitle="Your programme, supervisors and progress-report schedule."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Programme">
          <Field k="Faculty" v={app.faculty} />
          <Field k="Department" v={app.department} />
          <Field k="Degree" v={app.degreeProgram} />
          <Field
            k="Study mode"
            v={
              app.studyMode === "FULL_TIME"
                ? "Full time"
                : app.studyMode === "PART_TIME"
                  ? "Part time"
                  : "—"
            }
          />
          <Field
            k="Duration"
            v={app.durationYears ? `${app.durationYears} years` : "—"}
          />
          <Field k="Start year" v={app.programStartYear} />
        </Card>

        <Card title="Research & supervisors">
          <Field k="Proposal" v={proposal?.title} />
          <Field k="Main supervisor" v={main?.name} />
          <Field
            k="Co-supervisors"
            v={co.length ? co.map((s) => s.supervisor.name).join(", ") : "—"}
          />
        </Card>
      </div>

      <div className="mt-4 space-y-4">
        <Card title="Progress reports">
          <div className="mb-3 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-neutral-500">Total required: </span>
              <span className="font-semibold text-black">{schedule.length}</span>
            </div>
            <div>
              <span className="text-neutral-500">Submitted: </span>
              <span className="font-semibold text-black">{submittedCount}</span>
            </div>
            <div>
              <span className="text-neutral-500">Open now: </span>
              <span className="font-semibold text-black">{openNow.length}</span>
            </div>
          </div>
          {openNow.length > 0 ? (
            <p className="text-sm text-black">
              You have a report window open:{" "}
              <strong>{openNow.map((w) => w.label).join(", ")}</strong>.{" "}
              <Link href="/student/progress" className="underline">
                Submit now →
              </Link>
            </p>
          ) : (
            <p className="text-sm text-neutral-600">
              No window is open right now.{" "}
              <Link href="/student/progress" className="underline">
                View full schedule →
              </Link>
            </p>
          )}
        </Card>

        <Card title="Presentations">
          <p className="text-sm text-neutral-600">
            Your presentation will be scheduled by the Registrar after your application is approved.{" "}
            <Link href="/student/presentations" className="underline">
              View presentation schedule →
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
