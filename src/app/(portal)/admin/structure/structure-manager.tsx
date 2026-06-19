"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DegreeLevel, StudyMode } from "@prisma/client";
import {
  createDegree,
  createDepartment,
  createFaculty,
  deleteDegree,
  deleteDepartment,
  deleteFaculty,
  renameFaculty,
  type ActionResult,
} from "./actions";

export type DegreeNode = {
  id: number;
  name: string;
  level: DegreeLevel;
  type: string | null;
  studyModes: StudyMode[];
};

const MODE_LABEL: Record<StudyMode, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
};
export type DepartmentNode = {
  id: number;
  name: string;
  degrees: DegreeNode[];
};
export type FacultyNode = {
  id: number;
  name: string;
  departments: DepartmentNode[];
};

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black";
const primaryBtn =
  "rounded-md bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50";
const ghostBtn =
  "rounded-md border border-border px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:border-black hover:text-black disabled:opacity-50";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (fd: FormData) => Promise<ActionResult>, fd: FormData, onDone?: () => void) {
    setError(null);
    start(async () => {
      const res = await action(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onDone?.();
      router.refresh();
    });
  }
  return { pending, error, run, setError };
}

export function StructureManager({ faculties }: { faculties: FacultyNode[] }) {
  return (
    <div className="space-y-6">
      <AddFaculty />
      {faculties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
          No faculties yet. Add one above to get started.
        </div>
      ) : (
        faculties.map((f) => <FacultyCard key={f.id} faculty={f} />)
      )}
    </div>
  );
}

function AddFaculty() {
  const { pending, error, run } = useAction();
  return (
    <form
      action={(fd) => run(createFaculty, fd)}
      className="rounded-lg border border-border bg-white p-4"
    >
      <label className="mb-2 block text-sm font-semibold text-black">
        Add faculty
      </label>
      <div className="flex gap-2">
        <input name="name" placeholder="Faculty name" className={inputClass} required />
        <button type="submit" disabled={pending} className={primaryBtn}>
          Add
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-black">{error}</p>}
    </form>
  );
}

function FacultyCard({ faculty }: { faculty: FacultyNode }) {
  const { pending, error, run } = useAction();
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        {editing ? (
          <form
            action={(fd) => run(renameFaculty, fd, () => setEditing(false))}
            className="flex flex-1 gap-2"
          >
            <input type="hidden" name="id" value={faculty.id} />
            <input
              name="name"
              defaultValue={faculty.name}
              className={inputClass}
              required
            />
            <button type="submit" disabled={pending} className={ghostBtn}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={ghostBtn}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <h3 className="text-base font-bold text-black">{faculty.name}</h3>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className={ghostBtn}>
                Rename
              </button>
              <form action={(fd) => run(deleteFaculty, fd)}>
                <input type="hidden" name="id" value={faculty.id} />
                <button type="submit" disabled={pending} className={ghostBtn}>
                  Delete
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        {error && <p className="text-sm text-black">{error}</p>}
        {faculty.departments.map((d) => (
          <DepartmentRow key={d.id} department={d} />
        ))}
        <AddDepartment facultyId={faculty.id} />
      </div>
    </div>
  );
}

function AddDepartment({ facultyId }: { facultyId: number }) {
  const { pending, error, run } = useAction();
  return (
    <form
      action={(fd) => run(createDepartment, fd)}
      className="flex gap-2 border-t border-dashed border-border pt-3"
    >
      <input type="hidden" name="facultyId" value={facultyId} />
      <input name="name" placeholder="Add department" className={inputClass} required />
      <button type="submit" disabled={pending} className={ghostBtn}>
        Add dept
      </button>
      {error && <p className="self-center text-sm text-black">{error}</p>}
    </form>
  );
}

function DepartmentRow({ department }: { department: DepartmentNode }) {
  const { pending, error, run } = useAction();
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-black">{department.name}</p>
        <form action={(fd) => run(deleteDepartment, fd)}>
          <input type="hidden" name="id" value={department.id} />
          <button type="submit" disabled={pending} className={ghostBtn}>
            Remove
          </button>
        </form>
      </div>

      <ul className="mb-2 space-y-1">
        {department.degrees.length === 0 ? (
          <li className="text-xs text-neutral-500">No degrees yet.</li>
        ) : (
          department.degrees.map((deg) => (
            <li
              key={deg.id}
              className="flex items-center justify-between rounded border border-border bg-white px-2.5 py-1.5"
            >
              <span className="text-sm text-black">
                {deg.name}
                <span className="ml-2 rounded bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {deg.level}
                </span>
                {deg.studyModes.map((m) => (
                  <span
                    key={m}
                    className="ml-1 rounded border border-black px-1.5 py-0.5 text-[10px] font-semibold text-black"
                  >
                    {MODE_LABEL[m]}
                  </span>
                ))}
                {deg.type && (
                  <span className="ml-1 text-xs text-neutral-500">{deg.type}</span>
                )}
              </span>
              <DeleteDegreeButton id={deg.id} />
            </li>
          ))
        )}
      </ul>

      <AddDegree departmentId={department.id} />
      {error && <p className="mt-1 text-sm text-black">{error}</p>}
    </div>
  );
}

function DeleteDegreeButton({ id }: { id: number }) {
  const { pending, run } = useAction();
  return (
    <form action={(fd) => run(deleteDegree, fd)}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className={ghostBtn}>
        Delete
      </button>
    </form>
  );
}

function AddDegree({ departmentId }: { departmentId: number }) {
  const { pending, error, run } = useAction();
  return (
    <form
      action={(fd) => run(createDegree, fd)}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="departmentId" value={departmentId} />
      <input
        name="name"
        placeholder="Degree name (e.g. PhD in Computer Science)"
        className="min-w-[14rem] flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
        required
      />
      <select
        name="level"
        defaultValue="PHD"
        className="rounded-md border border-border bg-white px-2 py-2 text-sm text-black outline-none focus:border-black"
      >
        <option value="PHD">PhD</option>
        <option value="MPHIL">MPhil</option>
        <option value="OTHER">Other</option>
      </select>
      <input
        name="type"
        placeholder="Type (optional)"
        className="w-32 rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
      />
      <label className="flex items-center gap-1 text-xs text-black">
        <input type="checkbox" name="fullTime" defaultChecked /> Full time
      </label>
      <label className="flex items-center gap-1 text-xs text-black">
        <input type="checkbox" name="partTime" defaultChecked /> Part time
      </label>
      <button type="submit" disabled={pending} className={ghostBtn}>
        Add degree
      </button>
      {error && <p className="w-full text-sm text-black">{error}</p>}
    </form>
  );
}
