"use client";

import { useState } from "react";
import { resetStudentPassword } from "../actions";
import { useServerAction } from "@/components/use-server-action";

export function ResetPassword({ applicationId }: { applicationId: number }) {
  const { pending, error, run } = useServerAction();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);

  function submit() {
    run({
      action: () => resetStudentPassword(applicationId, value),
      onSuccess: () => {
        setDone(true);
        setValue("");
      },
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className="mt-3 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-black hover:bg-brand hover:text-white"
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
          className="min-w-[14rem] flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black hover:border-brand"
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
