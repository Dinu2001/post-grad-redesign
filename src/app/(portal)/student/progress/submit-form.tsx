"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileField, type UploadedRef } from "@/app/register/file-field";
import { submitProgressReport } from "./actions";

export function SubmitForm({
  periodKey,
  label,
}: {
  periodKey: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<UploadedRef | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!file) {
      setError("Attach your progress report file.");
      return;
    }
    start(async () => {
      const res = await submitProgressReport({ periodKey, description, file });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
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
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-black"
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-black">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? "Submitting…" : "Submit"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black hover:border-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
