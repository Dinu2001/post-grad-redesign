"use client";

import { useMemo, useState } from "react";
import type {
  StudentProgressRow,
  SupervisorReviewStatus,
} from "@/lib/admin-progress";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const REVIEW_STYLES: Record<SupervisorReviewStatus, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  PENDING: "bg-amber-100 text-amber-700",
};

function presentationBadge(p: StudentProgressRow["presentation"]) {
  if (!p) return { label: "Not scheduled", cls: "bg-neutral-100 text-neutral-500" };
  if (p.isFinal) return { label: "Approved", cls: "bg-emerald-100 text-emerald-700" };
  if (p.isDone) return { label: "Completed", cls: "bg-sky-100 text-sky-700" };
  return { label: "Scheduled", cls: "bg-amber-100 text-amber-700" };
}

export function ProgressMonitor({
  students,
  showFaculty,
}: {
  students: StudentProgressRow[];
  showFaculty?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        (s.proposalTitle ?? "").toLowerCase().includes(q) ||
        s.supervisorNames.some((n) => n.toLowerCase().includes(q)),
    );
  }, [students, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <svg
          className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student, proposal or supervisor…"
          className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-sm text-neutral-500">
          {students.length === 0
            ? "No students with proposals yet."
            : "No students match your search."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const open = openId === s.applicationId;
            const pres = presentationBadge(s.presentation);
            return (
              <div
                key={s.applicationId}
                className="card-shadow rounded-2xl border border-border bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{s.studentName}</p>
                    <p className="truncate text-sm text-neutral-600">
                      {s.proposalTitle ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {showFaculty && s.faculty ? `${s.faculty} · ` : ""}
                      {s.degreeProgram ?? ""}
                      {s.supervisorNames.length > 0
                        ? ` · ${s.supervisorNames.join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pres.cls}`}>
                      Presentation: {pres.label}
                    </span>
                    {s.presentation && (
                      <span className="text-xs text-neutral-500">{fmt(s.presentation.date)}</span>
                    )}
                    <span className="text-xs text-neutral-500">
                      {s.reports.length} report{s.reports.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : s.applicationId)}
                  className="mt-3 rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-light"
                >
                  {open ? "Hide details" : "Details"}
                </button>

                {open && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    {s.reports.length === 0 ? (
                      <p className="text-sm text-neutral-500">
                        No progress reports submitted yet.
                      </p>
                    ) : (
                      s.reports.map((r) => (
                        <div key={r.id} className="rounded-xl border border-border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{r.title}</p>
                              <p className="text-xs text-neutral-500">
                                Submitted {fmt(r.submittedAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.allApproved && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  Stage complete
                                </span>
                              )}
                              {r.filePath && (
                                <a
                                  href={`/api/files?path=${encodeURIComponent(r.filePath)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-brand-dark underline"
                                >
                                  View report
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 space-y-1.5">
                            {r.supervisors.map((sup, i) => (
                              <div
                                key={i}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-2.5 py-1.5"
                              >
                                <span className="text-sm text-neutral-700">
                                  {sup.supervisorName}
                                  {sup.isMain && (
                                    <span className="ml-1 text-xs text-brand-dark">(Main)</span>
                                  )}
                                </span>
                                <div className="flex items-center gap-2">
                                  {sup.reviewedAt && (
                                    <span className="text-[11px] text-neutral-400">
                                      {fmt(sup.reviewedAt)}
                                    </span>
                                  )}
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${REVIEW_STYLES[sup.status]}`}
                                  >
                                    {sup.status === "PENDING" ? "Not reviewed" : sup.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {r.supervisors.some((sup) => sup.comment) && (
                            <div className="mt-2 space-y-1">
                              {r.supervisors
                                .filter((sup) => sup.comment)
                                .map((sup, i) => (
                                  <p key={i} className="text-xs text-neutral-600">
                                    <span className="font-semibold">{sup.supervisorName}:</span>{" "}
                                    {sup.comment}
                                  </p>
                                ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
