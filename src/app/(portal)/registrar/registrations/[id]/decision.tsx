"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveRegistration, rejectRegistration } from "../actions";

export function RegistrationDecision({ applicationId }: { applicationId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [approved, setApproved] = useState<{ email: string; pw: string } | null>(
    null,
  );

  function approve() {
    setError(null);
    start(async () => {
      const res = await approveRegistration(applicationId, tempPassword);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setApproved({ email: res.email, pw: res.tempPassword });
      router.refresh();
    });
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

  if (approved) {
    return (
      <div className="rounded-lg border border-black bg-neutral-50 p-5">
        <h3 className="text-base font-bold text-black">
          Approved — student account created
        </h3>
        <p className="mt-2 text-sm text-black">
          Email: <span className="font-mono">{approved.email}</span>
        </p>
        <p className="text-sm text-black">
          Temporary password: <span className="font-mono">{approved.pw}</span>
        </p>
        <p className="mt-2 text-xs text-neutral-600">
          Share these credentials with the student (email delivery is not yet
          configured). They must change the password on first login.
        </p>
        <button
          onClick={() => router.push("/registrar/registrations")}
          className="mt-4 rounded-md border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-black hover:text-white"
        >
          Back to queue
        </button>
      </div>
    );
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
          <div className="max-w-sm">
            <label className="mb-1 block text-sm font-medium text-black">
              Temporary password{" "}
              <span className="font-normal text-neutral-500">
                (optional — leave blank to auto-generate)
              </span>
            </label>
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={pending}
              className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {pending ? "Approving…" : "Approve & create account"}
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
