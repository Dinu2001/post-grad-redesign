"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitSupervisorReview } from "./actions";

export function ReviewForm({
  progressId,
  initialComment,
  initialStatus,
  reviewedAt,
}: {
  progressId: number;
  initialComment: string | null;
  initialStatus?: string | null;
  reviewedAt?: Date | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [comment, setComment] = useState(initialComment ?? "");
  const [error, setError] = useState<string | null>(null);
  const isReviewed = initialStatus && ["APPROVED", "REJECTED"].includes(initialStatus);

  function submit(status: "APPROVED" | "REJECTED") {
    setError(null);
    const fd = new FormData();
    fd.set("progressId", String(progressId));
    fd.set("status", status);
    fd.set("comment", comment);

    start(async () => {
      const res = await submitSupervisorReview(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (isReviewed) {
    return (
      <div className="mt-3 rounded border border-border bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-black">
            {initialStatus === "APPROVED" ? "✓ Approved" : "✗ Rejected"}
          </span>
          {reviewedAt && (
            <span className="text-xs text-neutral-500">
              {new Date(reviewedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {comment && (
          <p className="mt-2 rounded bg-white p-2 text-sm text-neutral-700">{comment}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded border border-border p-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-black"
        placeholder="Comment (optional)"
      />
      {error && <p className="text-sm text-black">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("APPROVED")}
          disabled={pending}
          className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white"
        >
          {pending ? "Saving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => submit("REJECTED")}
          disabled={pending}
          className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-black"
        >
          {pending ? "Saving…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
