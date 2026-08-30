"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rejectRegistration } from "../actions";

export function RegistrationDecision({ applicationId }: { applicationId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState("");

  function schedulePresentation() {
    router.push(`/registrar/presentations/assign/${applicationId}`);
  }

  function reject() {
    setError(null);
    start(async () => {
      const res = await rejectRegistration(applicationId, comment);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/registrar/registrations");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h3 className="mb-3 text-base font-bold text-black">Decision</h3>
      {error && (
        <p className="mb-3 rounded-md border border-black bg-neutral-50 px-3 py-2 text-sm text-black">
          {error}
        </p>
      )}
      {rejecting ? (
        <div className="space-y-3">
          <textarea
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-black"
            placeholder="Reason for rejection (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={reject}
              disabled={pending}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {pending ? "Rejecting…" : "Confirm reject"}
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black hover:border-black"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            After reviewing the submitted documents, assign a presentation date before creating the student account.
          </p>
          <div className="flex gap-2">
            <button
              onClick={schedulePresentation}
              className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Schedule presentation date
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={pending}
              className="rounded-md border border-black px-5 py-2 text-sm font-semibold text-black hover:bg-black hover:text-white disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
