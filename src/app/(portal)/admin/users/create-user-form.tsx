"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStaffUser } from "./actions";

type FacultyOption = { id: number; name: string };

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black";

export function CreateUserForm({ faculties }: { faculties: FacultyOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [role, setRole] = useState("REGISTRAR");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; pw: string } | null>(
    null,
  );

  function onSubmit(fd: FormData) {
    setError(null);
    setCreated(null);
    start(async () => {
      const res = await createStaffUser(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCreated({ email: res.email, pw: res.tempPassword });
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h3 className="mb-4 text-base font-bold text-black">Add staff user</h3>
      <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-black">
            Full name
          </label>
          <input name="fullName" className={inputClass} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black">Email</label>
          <input name="email" type="email" className={inputClass} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black">Role</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
          >
            <option value="REGISTRAR">Registrar</option>
            <option value="FACULTY_ADMIN">Faculty Admin</option>
            <option value="MAIN_ADMIN">Main Admin</option>
          </select>
        </div>
        {role === "FACULTY_ADMIN" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Faculty
            </label>
            <select name="facultyId" className={inputClass} required>
              <option value="">Select faculty…</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create user"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-md border border-black bg-neutral-50 px-3 py-2 text-sm text-black">
          {error}
        </p>
      )}
      {created && (
        <div className="mt-3 rounded-md border border-black bg-neutral-50 px-3 py-2 text-sm text-black">
          <p className="font-semibold">User created.</p>
          <p>
            Email: <span className="font-mono">{created.email}</span>
          </p>
          <p>
            Temporary password: <span className="font-mono">{created.pw}</span>
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Share these credentials with the user. They must change the password
            on first login.
          </p>
        </div>
      )}
    </div>
  );
}
