"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetStudentPassword } from "../actions";

export function ResetPassword({ applicationId }: { applicationId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit() {
    setError(null);
    start(async () => {
      const res = await resetStudentPassword(applicationId, value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      setValue("");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className="mt-3 rounded-md border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-black hover:text-white"
      >
        Set / reset temporary password
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-border bg-white p-3">
      <label className="mb-1 block text-sm font-medium text-black">
        New temporary password
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="At least 6 characters"
          className="min-w-[14rem] flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black hover:border-black"
        >
          Cancel
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        The student will be required to change it again on next login.
      </p>
      {error && <p className="mt-1 text-sm text-black">{error}</p>}
      {done && (
        <p className="mt-1 text-sm text-black">
          Temporary password updated. It now shows in the credentials above and
          in the Approved dashboard.
        </p>
      )}
    </div>
  );
}
