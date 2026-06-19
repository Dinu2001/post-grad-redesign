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
  ACTIVE: "bg-neutral-200 text-black",
  APPROVED: "bg-black text-white",
  REJECTED: "border border-black text-black",
};

export function ApplicationsTable({
  rows,
  emptyMessage = "No applications.",
}: {
  rows: AppRow[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-2 font-semibold">Applicant</th>
            <th className="px-4 py-2 font-semibold">NIC</th>
            <th className="px-4 py-2 font-semibold">Faculty</th>
            <th className="px-4 py-2 font-semibold">Degree</th>
            <th className="px-4 py-2 font-semibold">Submitted</th>
            <th className="px-4 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-medium text-black">{r.fullName}</td>
              <td className="px-4 py-2 text-neutral-600">{r.nic}</td>
              <td className="px-4 py-2 text-neutral-600">{r.faculty ?? "—"}</td>
              <td className="px-4 py-2 text-neutral-600">
                {r.degreeProgram ?? "—"}
              </td>
              <td className="px-4 py-2 text-neutral-600">
                {r.registrationDate.toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
