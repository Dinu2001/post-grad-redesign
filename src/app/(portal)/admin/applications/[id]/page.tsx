import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ApprovedApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("MAIN_ADMIN");
  const { id } = await params;

  const application = await prisma.applicationPostGraduate.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      fullName: true,
      nic: true,
      faculty: true,
      degreeProgram: true,
      status: true,
      registrationDate: true,
      researchProposals: {
        select: {
          id: true,
          title: true,
          files: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
            },
          },
          supervisors: {
            select: {
              id: true,
              isMain: true,
              supervisor: { select: { name: true } },
              cvDocument: true,
              consentDocument: true,
            },
            orderBy: { isMain: "desc" },
          },
        },
      },
    },
  });

  if (!application) {
    return <div>Application not found</div>;
  }

  const proposal = application.researchProposals[0];

  return (
    <>
      <PageHeader
        title={`Application: ${application.fullName}`}
        subtitle="View all details and download files"
      />
      <div className="space-y-6">
        {/* Application Info */}
        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="text-lg font-semibold text-black">Application Details</h3>
          <div className="mt-3 grid gap-3 text-sm">
            <div>
              <p className="font-medium text-neutral-600">Full Name</p>
              <p className="text-black">{application.fullName}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">NIC</p>
              <p className="text-black">{application.nic}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Faculty</p>
              <p className="text-black">{application.faculty}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Degree Program</p>
              <p className="text-black">{application.degreeProgram}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Status</p>
              <p className="text-black">{application.status}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Registration Date</p>
              <p className="text-black">{fmt(application.registrationDate)}</p>
            </div>
          </div>
        </div>

        {/* Proposal */}
        {proposal && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h3 className="text-lg font-semibold text-black">Research Proposal</h3>
            <p className="mt-2 text-black">{proposal.title}</p>

            {/* Proposal Files */}
            {proposal.files.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-neutral-600">Files</p>
                <ul className="mt-2 space-y-1">
                  {proposal.files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={`/api/files?path=${encodeURIComponent(file.filePath)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-black underline"
                      >
                        {file.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supervisors */}
            {proposal.supervisors.length > 0 && (
              <div className="mt-6">
                <p className="font-medium text-neutral-600">Supervisors</p>
                <div className="mt-3 space-y-4">
                  {proposal.supervisors.map((sup) => (
                    <div key={sup.id} className="rounded border border-border p-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-black">{sup.supervisor.name}</p>
                        {sup.isMain && (
                          <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            MAIN
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        {sup.cvDocument && (
                          <a
                            href={`/api/files?path=${encodeURIComponent(sup.cvDocument)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-black underline"
                          >
                            📄 Supervisor CV
                          </a>
                        )}
                        {sup.consentDocument && (
                          <a
                            href={`/api/files?path=${encodeURIComponent(sup.consentDocument)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-black underline"
                          >
                            📋 Letter of Willingness to Supervise
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
