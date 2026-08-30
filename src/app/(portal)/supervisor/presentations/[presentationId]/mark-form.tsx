"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markPresentationDone } from "../actions";

export function MarkPresentationCompleteForm({
  presentationId,
  isDone,
}: {
  presentationId: number;
  isDone: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleMarkDone() {
    setError(null);
    start(async () => {
      const res = await markPresentationDone(presentationId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (isDone) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <h3 className="mb-2 text-base font-bold text-yellow-900">✓ Marked Complete</h3>
        <p className="text-sm text-yellow-800">
          This presentation has been marked as completed and is awaiting the Registrar's review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-white p-4">
      <h3 className="text-base font-bold text-black">Mark Presentation Complete</h3>
      {error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <p className="text-sm text-neutral-600">
        Once you mark this presentation as complete, the Registrar will review the result.
      </p>
      <button
        onClick={handleMarkDone}
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Marking..." : "Mark Complete"}
      </button>
    </div>
  );
}
