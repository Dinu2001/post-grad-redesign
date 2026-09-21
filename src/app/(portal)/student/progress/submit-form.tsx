"use client";

import { useState } from "react";
import { FileField, type UploadedRef } from "@/app/register/file-field";
import { submitProgressReport } from "./actions";
import { useServerAction } from "@/components/use-server-action";

export function SubmitForm({
  periodKey,
  label,
}: {
  periodKey: string;
  label: string;
}) {
  const { pending, error, run, setError } = useServerAction();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<UploadedRef | null>(null);
  const [description, setDescription] = useState("");

  function submit() {
    if (!file) {
      setError("Attach your progress report file.");
      return;
    }
    run({
      action: () => submitProgressReport({ periodKey, description, file }),
      onSuccess: () => {
        setOpen(false);
      },
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
      >
        Submit report
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-md border border-border bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-black">Submit · {label}</p>
      <div className="space-y-2">
        <FileField
          label="Progress report file"
          folder="progress"
          accept=".pdf,.doc,.docx"
          value={file}
          onChange={setFile}
        />
        <textarea
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-black">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "Submitting…" : "Submit"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black hover:border-brand"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
