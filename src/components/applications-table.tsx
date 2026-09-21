import Link from "next/link";
import type { ApplicationStatus } from "@prisma/client";

export type AppRow = {
  id: number;
  fullName: string;
  nic: string;
  faculty: string | null;
  degreeProgram: string | null;
  status: ApplicationStatus;
  registrationDate: Date;
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  ACTIVE: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

export function ApplicationsTable({
  rows,
  emptyMessage = "No applications.",
  showDetailLink = false,
}: {
  rows: AppRow[];
  emptyMessage?: string;
  showDetailLink?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="card-shadow rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="card-shadow overflow-x-auto rounded-2xl border border-border bg-white">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead className="border-b border-border bg-brand-light text-xs uppercase tracking-wide text-brand-dark">
          <tr>
            <th className="px-4 py-3 font-semibold">Applicant</th>
            <th className="px-4 py-3 font-semibold">NIC</th>
            <th className="px-4 py-3 font-semibold">Faculty</th>
            <th className="px-4 py-3 font-semibold">Degree</th>
            <th className="px-4 py-3 font-semibold">Submitted</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            {showDetailLink && <th className="px-4 py-3 font-semibold"></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-border transition-colors last:border-0 hover:bg-brand-light/40"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {r.fullName}
              </td>
              <td className="px-4 py-3 text-neutral-600">{r.nic}</td>
              <td className="px-4 py-3 text-neutral-600">{r.faculty ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-600">
                {r.degreeProgram ?? "—"}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {r.registrationDate.toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                >
                  {r.status}
                </span>
              </td>
              {showDetailLink && (
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/applications/${r.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-light px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white"
                  >
                    View
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
