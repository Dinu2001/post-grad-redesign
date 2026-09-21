"use client";

import Link from "next/link";
import { useState } from "react";
import { useServerAction } from "@/components/use-server-action";
import { ROLE_LABELS } from "@/lib/roles";
import { updateProfile } from "./actions";

export function ProfileForm({
  fullName,
  email,
  role,
}: {
  fullName: string;
  email: string;
  role: keyof typeof ROLE_LABELS;
}) {
  const { pending, error, run } = useServerAction();
  const [name, setName] = useState(fullName);
  const [address, setAddress] = useState(email);
  const [saved, setSaved] = useState(false);

  function submit(form: FormData) {
    setSaved(false);
    run({
      action: () => updateProfile(form),
      onSuccess: (result) => {
        setName(result.fullName);
        setAddress(result.email);
        setSaved(true);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-lg border border-border bg-white p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/15 text-base font-bold text-brand">
          {name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-black">{name}</p>
          <p className="truncate text-sm text-neutral-500">{address}</p>
          <p className="mt-1 text-xs font-medium text-brand">{ROLE_LABELS[role]}</p>
        </div>
      </div>

      <form action={submit} className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-base font-bold text-black">Profile information</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Update the account details shown across the portal.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-black">
            Full name
            <input
              name="fullName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-normal text-black outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </label>
          <label className="block text-sm font-medium text-black">
            Email address
            <input
              name="email"
              type="email"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-normal text-black outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        {saved && <p className="mt-3 text-sm text-green-700">Profile updated.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save profile"}
          </button>
          <Link
            href="/account/password"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black transition hover:border-brand hover:text-brand-dark"
          >
            Change password
          </Link>
        </div>
      </form>

      <div className="rounded-lg border border-dashed border-border bg-white p-5 text-sm text-neutral-500">
        Profile images are not enabled in the current account schema. Your initials are used as the account avatar.
      </div>
    </div>
  );
}
