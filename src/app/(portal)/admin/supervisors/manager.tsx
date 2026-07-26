"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  type ActionResult,
} from "./actions";

export type SupervisorRow = {
  id: number;
  name: string;
  title: string | null;
  university: string | null;
  telephone: string | null;
  hasAccount: boolean;
  email?: string;
  initialPassword?: string | null;
  mustChangePassword?: boolean;
  usageCount: number;
};

const input =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function run(
    action: (fd: FormData) => Promise<ActionResult>,
    fd: FormData,
    done?: (res: ActionResult) => void,
  ) {
    setError(null);
    start(async () => {
      const res = await action(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      done?.(res);
      router.refresh();
    });
  }
  return { pending, error, run };
}

export function SupervisorManager({ supervisors }: { supervisors: SupervisorRow[] }) {
  return (
    <div className="space-y-6">
      <AddSupervisor />
      {supervisors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
          No supervisors yet. Add them above so students can select them during
          registration.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">University</th>
                <th className="px-4 py-2 font-semibold">Telephone</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((s) => (
                <SupervisorRowItem key={s.id} s={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddSupervisor() {
  const { pending, error, run } = useAction();
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);
  return (
    <form
      action={(fd) => run(createSupervisor, fd, (res) => {
        if (res.ok && res.tempPassword && res.email) {
          setCreated({ email: res.email, tempPassword: res.tempPassword });
        } else {
          setCreated(null);
        }
      })}
      className="rounded-lg border border-border bg-white p-4"
    >
      <h3 className="mb-3 text-base font-bold text-black">Add supervisor</h3>
      <div className="grid gap-3 sm:grid-cols-5">
        <input name="name" placeholder="Full name *" className={input} required />
        <input name="email" type="email" placeholder="Email *" className={input} required />
        <input name="title" placeholder="Title (e.g. Prof.)" className={input} />
        <input name="university" placeholder="University" className={input} />
        <input name="telephone" placeholder="Telephone" className={input} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Add supervisor
        </button>
        {error && <p className="text-sm text-black">{error}</p>}
      </div>
      {created && (
        <div className="mt-3 rounded-md border border-black bg-neutral-50 p-3 text-sm text-black">
          <p className="font-semibold">Temporary login created</p>
          <p>Email: {created.email}</p>
          <p>Password: {created.tempPassword}</p>
        </div>
      )}
    </form>
  );
}

function SupervisorRowItem({ s }: { s: SupervisorRow }) {
  const { pending, error, run } = useAction();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={5} className="px-4 py-3">
          <form
            action={(fd) => run(updateSupervisor, fd, () => setEditing(false))}
            className="grid items-center gap-2 sm:grid-cols-5"
          >
            <input type="hidden" name="id" value={s.id} />
            <input name="name" defaultValue={s.name} className={input} required />
            <input name="title" defaultValue={s.title ?? ""} className={input} placeholder="Title" />
            <input name="university" defaultValue={s.university ?? ""} className={input} placeholder="University" />
            <input name="telephone" defaultValue={s.telephone ?? ""} className={input} placeholder="Telephone" />
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className="rounded-md bg-black px-3 py-2 text-xs font-semibold text-white">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-black">
                Cancel
              </button>
            </div>
          </form>
          {error && <p className="mt-1 text-sm text-black">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-2 font-medium text-black">
        <div>
          <p>{s.name}</p>
          {s.hasAccount && (
            <div className="mt-1 space-y-1">
              <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                ACCOUNT
              </span>
              {s.initialPassword && s.mustChangePassword && (
                <div className="mt-2 text-xs text-neutral-600">
                  <p className="font-medium">Temp. login:</p>
                  <p>Email: {s.email}</p>
                  <p>Password: <code className="bg-neutral-100 px-1 py-0.5 font-mono">{s.initialPassword}</code></p>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-2 text-neutral-600">{s.title ?? "—"}</td>
      <td className="px-4 py-2 text-neutral-600">{s.university ?? "—"}</td>
      <td className="px-4 py-2 text-neutral-600">{s.telephone ?? "—"}</td>
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-black hover:text-black"
          >
            Edit
          </button>
          <form action={(fd) => run(deleteSupervisor, fd)}>
            <input type="hidden" name="id" value={s.id} />
            <button
              type="submit"
              disabled={pending || s.usageCount > 0}
              title={s.usageCount > 0 ? "Used in an application" : "Delete"}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-black hover:text-black disabled:opacity-40"
            >
              Delete
            </button>
          </form>
        </div>
        {error && <p className="mt-1 text-right text-xs text-black">{error}</p>}
      </td>
    </tr>
  );
}
