import { requireRole } from "@/lib/guard";
import { getStudentApplication } from "@/lib/student";
import {
  progressSchedule,
  windowStatus,
  canSubmit,
  type WindowStatus,
} from "@/lib/progress";
import { PageHeader, PlaceholderCard } from "@/components/page-header";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<WindowStatus, string> = {
  submitted: "bg-black text-white",
  open: "border border-black text-black",
  overdue: "bg-neutral-800 text-white",
  upcoming: "bg-neutral-200 text-neutral-600",
};
const STATUS_LABEL: Record<WindowStatus, string> = {
  submitted: "Submitted",
  open: "Open now",
  overdue: "Overdue",
  upcoming: "Upcoming",
};

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function StudentProgressPage() {
  const session = await requireRole("STUDENT");
  const app = await getStudentApplication(session.userId);
  const proposal = app?.researchProposals[0];

  if (!app || !proposal) {
    return (
      <>
        <PageHeader title="Progress Reports" subtitle="Submission schedule" />
        <PlaceholderCard>
          Your approved application is not available yet, so no schedule can be
          shown.
        </PlaceholderCard>
      </>
    );
  }

  const schedule = progressSchedule(
    proposal.degreeSought.level,
    app.studyMode,
    app.programStartYear,
  );

  const byKey = new Map(
    proposal.progressReports
      .filter((r) => r.periodKey)
      .map((r) => [r.periodKey as string, r]),
  );
  const submittedKeys = new Set(byKey.keys());
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Progress Reports"
        subtitle={`${schedule.length} reports required over ${app.durationYears ?? "—"} years — two each year (Jan–Jun and Jul–Dec).`}
      />

      {schedule.length === 0 ? (
        <PlaceholderCard>
          A schedule could not be derived for your programme.
        </PlaceholderCard>
      ) : (
        <div className="space-y-3">
          {schedule.map((w) => {
            const status = windowStatus(w, now, submittedKeys);
            const report = byKey.get(w.periodKey);
            const file = report?.files[0];
            return (
              <div
                key={w.periodKey}
                className="rounded-lg border border-border bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-black">
                      Report {w.index}: {w.label}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Window: {fmt(w.windowStart)} – {fmt(w.windowEnd)}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[status]}`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>

                {status === "submitted" && report ? (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="text-neutral-600">
                      Submitted {fmt(report.submittedAt)}
                      {file && (
                        <>
                          {" · "}
                          <a
                            href={`/api/files?path=${encodeURIComponent(file.filePath)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-black underline"
                          >
                            {file.originalFileName}
                          </a>
                        </>
                      )}
                    </div>
                    {report.reviews.length > 0 && (
                      <div className="rounded border border-border bg-neutral-50 p-2">
                        <p className="font-semibold text-black">Supervisor feedback:</p>
                        {report.reviews.map((review) => (
                          <div key={review.id} className="mt-1 text-xs text-neutral-600">
                            <p className="font-medium text-black">
                              {review.supervisor.name} ({review.status})
                            </p>
                            {review.comment && <p>{review.comment}</p>}
                            {review.reviewedAt && (
                              <p className="mt-0.5 text-neutral-500">{fmt(review.reviewedAt)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : canSubmit(status) ? (
                  <div className="mt-2">
                    <SubmitForm periodKey={w.periodKey} label={w.label} />
                    {status === "overdue" && (
                      <p className="mt-1 text-xs text-neutral-500">
                        This window has closed — your submission will be marked
                        late.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">
                    Opens {fmt(w.windowStart)}.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
