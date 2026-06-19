"use client";

import { useState } from "react";

export type UploadedRef = { path: string; fileName: string };

export function FileField({
  folder,
  value,
  onChange,
  label,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
}: {
  folder: string;
  value: UploadedRef | null;
  onChange: (v: UploadedRef | null) => void;
  label?: string;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange({ path: data.path, fileName: data.fileName });
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-black">{label}</label>
      )}
      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-black bg-neutral-50 px-3 py-2 text-sm">
          <span className="truncate text-black">✓ {value.fileName}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 text-xs font-medium text-neutral-600 underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-white px-3 py-2 text-sm text-neutral-600 hover:border-black hover:text-black">
          {uploading ? "Uploading…" : "Choose file"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => handle(e.target.files?.[0])}
          />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-black">{error}</p>}
    </div>
  );
}
