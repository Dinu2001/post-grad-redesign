import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { RegistrationDecision } from "./decision";
import { ResetPassword } from "./reset-password";

export const dynamic = "force-dynamic";

function FileLink({ path, name }: { path: string | null; name: string }) {
  if (!path) return <span className="text-neutral-400">—</span>;
  return (
    <a
      href={`/api/files?path=${encodeURIComponent(path)}`}
      target="_blank"
      rel="noreferrer"
      className="text-black underline underline-offset-2"
    >
      {name}
    </a>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-neutral-500">{k}</span>
      <span className="text-right font-medium text-black">{v || "—"}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-2 text-base font-bold text-black">{title}</h3>
      {children}
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("REGISTRAR");
  const { id } = await params;
  const appId = Number(id);
  if (!Number.isInteger(appId)) notFound();

  const app = await prisma.applicationPostGraduate.findUnique({
    where: { id: appId },
    include: {
      user: { select: { email: true, initialPassword: true, mustChangePassword: true } },
      emails: true,
      contacts: true,
      academicQualifications: { include: { files: true } },
      workExperiences: { include: { files: true } },
      professionalQualifications: { include: { files: true } },
      researchProposals: {
        include: {
          files: true,
          supervisors: { include: { supervisor: true } },
        },
      },
    },
  });
  if (!app) notFound();

  const docs = await prisma.uploadedFile.findMany({
    where: { applicationId: appId },
    orderBy: { id: "asc" },
  });
  const proposal = app.researchProposals[0];
  const decided = app.status !== "ACTIVE";

  return (
    <>
      <div className="mb-4">
        <Link
          href="/registrar/registrations"
          className="text-sm text-neutral-500 underline"
        >
          ← Back to queue
        </Link>
      </div>
      <PageHeader
        title={app.fullName}
        subtitle={`Application #${app.id} · ${app.status}`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Programme & Personal">
          <Field k="Faculty" v={app.faculty} />
          <Field k="Department" v={app.department} />
          <Field k="Degree" v={app.degreeProgram} />
          <Field
            k="Study mode"
            v={app.studyMode === "FULL_TIME" ? "Full time" : app.studyMode === "PART_TIME" ? "Part time" : ""}
          />
          <Field k="Duration" v={app.durationYears ? `${app.durationYears} years` : ""} />
          <Field k="Name with initials" v={app.nameWithInitials} />
          <Field k="NIC" v={app.nic} />
          <Field k="Date of birth" v={app.dateOfBirth.toLocaleDateString()} />
          <Field k="Marital status" v={app.maritalStatus} />
          <Field k="English proficiency" v={app.englishProficiency} />
          <Field k="Email" v={app.emails.map((e) => e.email).join(", ")} />
          <Field
            k="Contacts"
            v={app.contacts.map((c) => `${c.contactType}: ${c.contactValue}`).join(" · ")}
          />
          <Field k="Residential address" v={app.residentialAddress} />
          <Field k="Official address" v={app.officialAddress} />
        </Card>

        <Card title="Checklist documents">
          <ul className="space-y-1 text-sm">
            {docs.length === 0 ? (
              <li className="text-neutral-400">No uploaded documents.</li>
            ) : (
              docs.map((d) => (
                <li key={d.id} className="flex justify-between gap-3">
                  <span className="text-neutral-500">{d.category}</span>
                  <FileLink path={d.filePath} name={d.fileName} />
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card title="Academic qualifications">
          {app.academicQualifications.map((a) => (
            <div key={a.id} className="border-b border-border py-2 text-sm last:border-0">
              <p className="font-medium text-black">
                {a.degreeName} — {a.university}
              </p>
              <p className="text-neutral-500">
                Class {a.degreeClass || "—"} · GPA {a.gpa || "—"} · Credits{" "}
                {a.creditCount || "—"}
              </p>
              {a.files.map((f) => (
                <FileLink key={f.id} path={f.filePath} name={f.fileName} />
              ))}
            </div>
          ))}
        </Card>

        <Card title="Experience">
          <p className="mb-1 text-xs font-semibold uppercase text-neutral-400">Work</p>
          {app.workExperiences.length === 0 ? (
            <p className="text-sm text-neutral-400">None</p>
          ) : (
            app.workExperiences.map((w) => (
              <div key={w.id} className="py-1 text-sm">
                <span className="text-black">{w.organization}</span>{" "}
                <span className="text-neutral-500">— {w.positionHeld || "—"}</span>{" "}
                {w.files.map((f) => (
                  <FileLink key={f.id} path={f.filePath} name="(letter)" />
                ))}
              </div>
            ))
          )}
          <p className="mb-1 mt-3 text-xs font-semibold uppercase text-neutral-400">
            Professional
          </p>
          {app.professionalQualifications.length === 0 ? (
            <p className="text-sm text-neutral-400">None</p>
          ) : (
            app.professionalQualifications.map((p) => (
              <div key={p.id} className="py-1 text-sm">
                <span className="text-black">{p.institution}</span>{" "}
                <span className="text-neutral-500">— {p.fieldOfStudy || "—"}</span>{" "}
                {p.files.map((f) => (
                  <FileLink key={f.id} path={f.filePath} name="(proof)" />
                ))}
              </div>
            ))
          )}
        </Card>

        <Card title="Research proposal">
          <Field k="Title" v={proposal?.title} />
          <Field k="Objectives" v={proposal?.description} />
          <Field
            k="Proposal file"
            v={
              proposal?.files[0] ? (
                <FileLink path={proposal.files[0].filePath} name={proposal.files[0].fileName} />
              ) : null
            }
          />
        </Card>

        <Card title="Supervisors">
          {proposal?.supervisors.map((s) => (
            <div key={s.id} className="border-b border-border py-2 text-sm last:border-0">
              <p className="font-medium text-black">
                {s.supervisor.name}{" "}
                {s.isMain && (
                  <span className="ml-1 rounded bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    MAIN
                  </span>
                )}
              </p>
              <p className="flex gap-3">
                <FileLink path={s.cvDocument} name="CV" />
                <FileLink path={s.consentDocument} name="Willingness to supervise" />
              </p>
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-6">
        {!decided ? (
          <RegistrationDecision applicationId={app.id} />
        ) : app.status === "APPROVED" ? (
          <div className="rounded-lg border border-black bg-neutral-50 p-4">
            <h3 className="text-base font-bold text-black">
              Approved — student login credentials
            </h3>
            {app.user ? (
              app.user.mustChangePassword ? (
                <div className="mt-2 space-y-1 text-sm text-black">
                  <p>
                    Email: <span className="font-mono">{app.user.email}</span>
                  </p>
                  <p>
                    Temporary password:{" "}
                    <span className="font-mono">
                      {app.user.initialPassword ?? "(unavailable)"}
                    </span>
                  </p>
                  <p className="text-xs text-neutral-600">
                    Share these with the student. They disappear once the student
                    signs in and changes their password.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-600">
                  The student has signed in and changed their password.
                </p>
              )
            ) : (
              <p className="mt-2 text-sm text-neutral-600">No account on record.</p>
            )}
            {app.user && <ResetPassword applicationId={app.id} />}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted p-4 text-sm text-neutral-600">
            This application has been {app.status.toLowerCase()}.
          </div>
        )}
      </div>
    </>
  );
}
