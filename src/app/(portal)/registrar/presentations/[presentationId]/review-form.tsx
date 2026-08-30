"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approvePresentationResult } from "../actions";

export function PresentationReviewForm({
  presentationId,
  isDone,
  isFinal,
}: {
  presentationId: number;
  isDone: boolean;
  isFinal: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    if (!isDone) {
      setError("Presentation must be marked as completed by the supervisor first.");
      return;
    }

    setError(null);
    start(async () => {
      const res = await approvePresentationResult(presentationId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (isFinal) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4">
        <h3 className="mb-2 text-base font-bold text-green-900">✓ Approved</h3>
        <p className="text-sm text-green-800">
          This presentation has been approved. The student is now registered as a postgraduate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-white p-4">
      <div>
        <h3 className="mb-2 text-base font-bold text-black">Review Presentation Result</h3>
        {error && (
          <p className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {!isDone && (
          <p className="mb-3 text-sm text-neutral-600">
            Waiting for the supervisor to mark this presentation as completed.
          </p>
        )}
        {isDone && !isFinal && (
          <p className="mb-3 text-sm text-neutral-600">
            The presentation has been completed. Review the supervisor's feedback and approve
            the result.
          </p>
        )}
      </div>
      {isDone && !isFinal && (
        <button
          onClick={handleApprove}
          disabled={pending}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? "Approving..." : "Approve Presentation Result"}
        </button>
      )}
    </div>
  );
}
