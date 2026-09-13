"use client";

import { useMemo, useState } from "react";
import { ReviewForm } from "../review-form";

export type ReviewReport = {
  id: number;
  title: string;
  description: string | null;
  submittedAt: string;
  fileName: string | null;
  filePath: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
  reviewedAt: string | null;
};

export type StudentCard = {
  proposalId: number;
  studentName: string;
  proposalTitle: string;
  isMain: boolean;
  reports: ReviewReport[];
  submittedCount: number;
  reviewedCount: number;
  pendingCount: number;
  nextDue: { label: string; date: string } | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<ReviewReport["status"], string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  PENDING: "bg-amber-100 text-amber-700",
};

export function ReviewsClient({ students }: { students: StudentCard[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.proposalTitle.toLowerCase().includes(q),
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
          placeholder="Search students by name…"
          className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-sm text-neutral-500">
          {students.length === 0
            ? "No students are assigned to you yet."
            : "No students match your search."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((s) => {
            const open = openId === s.proposalId;
            return (
              <div
                key={s.proposalId}
                className={`card-shadow rounded-2xl border border-border bg-white p-4 ${
                  open ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{s.studentName}</p>
                    <p className="truncate text-sm text-neutral-600">{s.proposalTitle}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.isMain ? "bg-brand-light text-brand-dark" : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {s.isMain ? "Main" : "Co-supervisor"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-muted px-2 py-1 font-medium text-neutral-600">
                    {s.submittedCount} submitted
                  </span>
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    {s.reviewedCount} reviewed
                  </span>
                  {s.pendingCount > 0 && (
                    <span className="rounded-lg bg-amber-50 px-2 py-1 font-medium text-amber-700">
                      {s.pendingCount} to review
                    </span>
                  )}
                </div>

                {s.nextDue && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Next report: <span className="font-medium text-neutral-700">{s.nextDue.label}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : s.proposalId)}
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
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}
                            >
                              {r.status}
                            </span>
                          </div>
                          {r.description && (
                            <p className="mt-2 text-sm text-neutral-600">{r.description}</p>
                          )}
                          {r.filePath && (
                            <a
                              href={`/api/files?path=${encodeURIComponent(r.filePath)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-sm text-brand-dark underline"
                            >
                              Download report{r.fileName ? ` (${r.fileName})` : ""}
                            </a>
                          )}
                          <ReviewForm
                            progressId={r.id}
                            initialComment={r.comment}
                            initialStatus={r.status}
                            reviewedAt={r.reviewedAt ? new Date(r.reviewedAt) : null}
                          />
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
