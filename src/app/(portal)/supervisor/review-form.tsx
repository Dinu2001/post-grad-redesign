"use client";

import { useState } from "react";
import { submitSupervisorReview } from "./actions";
import { useServerAction } from "@/components/use-server-action";

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
  const { pending, error, run } = useServerAction();
  const [comment, setComment] = useState(initialComment ?? "");
  const isReviewed = initialStatus && ["APPROVED", "REJECTED"].includes(initialStatus);

  function submit(status: "APPROVED" | "REJECTED") {
    const fd = new FormData();
    fd.set("progressId", String(progressId));
    fd.set("status", status);
    fd.set("comment", comment);

    run({
      action: () => submitSupervisorReview(fd),
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
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        placeholder="Comment (optional)"
      />
      {error && <p className="text-sm text-black">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("APPROVED")}
          disabled={pending}
          className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
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
