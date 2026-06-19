import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { durationYears } from "@/lib/duration";

const fileSchema = z.object({
  path: z.string().min(1),
  fileName: z.string().min(1),
});
const optionalFile = fileSchema.nullable().optional();

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .nullable()
  .optional();

const contactSchema = z.object({
  type: z.enum(["MOBILE", "RESIDENTIAL", "OFFICE", "MOBILE_OFFICE"]),
  value: z.string().trim().min(3),
});

const academicSchema = z.object({
  university: z.string().trim().min(1),
  degreeName: z.string().trim().min(1),
  degreeClass: z.string().trim().optional().nullable(),
  gpa: z.string().trim().optional().nullable(),
  creditCount: z.string().trim().optional().nullable(),
  periodFrom: dateStr,
  periodTo: dateStr,
  file: optionalFile,
});

const workSchema = z.object({
  organization: z.string().trim().min(1),
  positionHeld: z.string().trim().optional().nullable(),
  periodFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodTo: dateStr,
  file: optionalFile,
});

const professionalSchema = z.object({
  institution: z.string().trim().min(1),
  fieldOfStudy: z.string().trim().optional().nullable(),
  periodFrom: dateStr,
  periodTo: dateStr,
  file: optionalFile,
});

const supervisorSchema = z.object({
  supervisorId: z.number().int().positive(),
  isMain: z.boolean(),
  cv: fileSchema,
  consent: fileSchema,
});

const schema = z.object({
  facultyId: z.number().int().positive(),
  departmentId: z.number().int().positive(),
  degreeId: z.number().int().positive(),

  fullName: z.string().trim().min(1),
  nameWithInitials: z.string().trim().min(1),
  nic: z.string().trim().min(5),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maritalStatus: z.enum(["SINGLE", "MARRIED"]).nullable().optional(),
  email: z.string().email(),
  studyMode: z.enum(["FULL_TIME", "PART_TIME"]),
  englishProficiency: z.string().trim().optional().nullable(),
  residentialAddress: z.string().trim().optional().nullable(),
  officialAddress: z.string().trim().optional().nullable(),
  contacts: z.array(contactSchema).min(1, "At least one contact number is required."),

  academics: z.array(academicSchema).min(1, "At least one academic qualification is required."),
  works: z.array(workSchema),
  professionals: z.array(professionalSchema),

  documents: z.object({
    cv: optionalFile,
    birthCertificate: optionalFile,
    transcript: optionalFile,
    referees: z.array(fileSchema),
    budgets: z.array(fileSchema),
  }),

  proposal: z.object({
    title: z.string().trim().min(1),
    objectives: z.string().trim().min(1),
    file: fileSchema,
  }),

  supervisors: z
    .array(supervisorSchema)
    .min(1, "Add at least one supervisor.")
    .max(5, "A maximum of five supervisors is allowed."),
});

function toDate(s: string | null | undefined): Date | null {
  return s ? new Date(`${s}T00:00:00Z`) : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Exactly one main supervisor.
  const mainCount = d.supervisors.filter((s) => s.isMain).length;
  if (mainCount !== 1) {
    return NextResponse.json(
      { error: "Select exactly one main supervisor." },
      { status: 400 },
    );
  }

  // Supervisors must be distinct and exist in the admin-managed list.
  const supervisorIds = d.supervisors.map((s) => s.supervisorId);
  if (new Set(supervisorIds).size !== supervisorIds.length) {
    return NextResponse.json(
      { error: "Each supervisor can be selected only once." },
      { status: 400 },
    );
  }
  const foundSupervisors = await prisma.supervisorProfile.count({
    where: { id: { in: supervisorIds } },
  });
  if (foundSupervisors !== supervisorIds.length) {
    return NextResponse.json(
      { error: "One or more selected supervisors are no longer available." },
      { status: 400 },
    );
  }

  // Validate the faculty → department → degree chain.
  const degree = await prisma.degreeSought.findUnique({
    where: { id: d.degreeId },
    include: { departmentRef: { include: { faculty: true } } },
  });
  if (
    !degree ||
    !degree.departmentRef ||
    degree.departmentRef.id !== d.departmentId ||
    degree.departmentRef.faculty.id !== d.facultyId
  ) {
    return NextResponse.json(
      { error: "Selected faculty, department and degree do not match." },
      { status: 400 },
    );
  }

  // Study mode must be one the degree is offered in.
  if (!degree.studyModes.includes(d.studyMode)) {
    return NextResponse.json(
      { error: "Selected study mode is not available for this degree." },
      { status: 400 },
    );
  }

  // One ACTIVE application per NIC (also guarded by a partial unique index).
  const existing = await prisma.applicationPostGraduate.findFirst({
    where: { nic: d.nic, status: "ACTIVE" },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An active application already exists for this NIC." },
      { status: 409 },
    );
  }

  const faculty = degree.departmentRef.faculty;
  const department = degree.departmentRef;
  const years = durationYears(degree.level, d.studyMode);
  const startYear = new Date().getUTCFullYear();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const app = await tx.applicationPostGraduate.create({
        data: {
          status: "ACTIVE",
          fullName: d.fullName,
          nameWithInitials: d.nameWithInitials,
          nic: d.nic,
          dateOfBirth: toDate(d.dateOfBirth)!,
          maritalStatus: d.maritalStatus ?? null,
          englishProficiency: d.englishProficiency ?? null,
          residentialAddress: d.residentialAddress ?? null,
          officialAddress: d.officialAddress ?? null,
          faculty: faculty.name,
          department: department.name,
          degreeProgram: degree.name,
          facultyId: faculty.id,
          studyMode: d.studyMode,
          durationYears: years,
          programStartYear: startYear,
          emails: { create: [{ email: d.email }] },
          contacts: {
            create: d.contacts.map((c) => ({
              contactType: c.type,
              contactValue: c.value,
            })),
          },
        },
      });

      // Academic qualifications (compulsory) + proof files.
      for (const a of d.academics) {
        await tx.academicQualification.create({
          data: {
            applicationId: app.id,
            university: a.university,
            degreeName: a.degreeName,
            degreeClass: a.degreeClass ?? null,
            gpa: a.gpa ?? null,
            creditCount: a.creditCount ?? null,
            periodFrom: toDate(a.periodFrom),
            periodTo: toDate(a.periodTo),
            files: a.file
              ? { create: [{ fileName: a.file.fileName, filePath: a.file.path }] }
              : undefined,
          },
        });
      }

      for (const w of d.works) {
        await tx.workExperience.create({
          data: {
            applicationId: app.id,
            organization: w.organization,
            positionHeld: w.positionHeld ?? null,
            periodFrom: toDate(w.periodFrom)!,
            periodTo: toDate(w.periodTo),
            files: w.file
              ? { create: [{ fileName: w.file.fileName, filePath: w.file.path }] }
              : undefined,
          },
        });
      }

      for (const p of d.professionals) {
        await tx.professionalQualification.create({
          data: {
            applicationId: app.id,
            institution: p.institution,
            fieldOfStudy: p.fieldOfStudy ?? null,
            periodFrom: toDate(p.periodFrom),
            periodTo: toDate(p.periodTo),
            files: p.file
              ? { create: [{ fileName: p.file.fileName, filePath: p.file.path }] }
              : undefined,
          },
        });
      }

      // Checklist document uploads.
      const docs: { file: { path: string; fileName: string }; category: string }[] = [];
      const { cv, birthCertificate, transcript, referees, budgets } = d.documents;
      if (cv) docs.push({ file: cv, category: "CV" });
      if (birthCertificate)
        docs.push({ file: birthCertificate, category: "BIRTH_CERTIFICATE" });
      if (transcript) docs.push({ file: transcript, category: "TRANSCRIPT" });
      for (const r of referees) docs.push({ file: r, category: "REFEREE_REPORT" });
      for (const b of budgets) docs.push({ file: b, category: "BUDGET" });
      if (docs.length) {
        await tx.uploadedFile.createMany({
          data: docs.map((x) => ({
            applicationId: app.id,
            fileName: x.file.fileName,
            filePath: x.file.path,
            category: x.category,
          })),
        });
      }

      // Research proposal + file.
      const proposal = await tx.researchProposal.create({
        data: {
          applicationId: app.id,
          degreeSoughtId: degree.id,
          title: d.proposal.title,
          description: d.proposal.objectives,
          files: {
            create: [
              { fileName: d.proposal.file.fileName, filePath: d.proposal.file.path },
            ],
          },
        },
      });

      // Link the proposal to the admin-managed supervisors the student chose.
      // The student-uploaded CV and willingness doc live on the link itself.
      for (const s of d.supervisors) {
        await tx.proposalSupervisor.create({
          data: {
            proposalId: proposal.id,
            supervisorId: s.supervisorId,
            isMain: s.isMain,
            cvDocument: s.cv.path,
            consentDocument: s.consent.path,
          },
        });
      }

      // Declaration drives the registrar/admin review workflow.
      await tx.applicantDeclaration.create({
        data: {
          applicationId: app.id,
          declarationDate: new Date(),
          status: "PENDING",
        },
      });

      return app;
    });

    return NextResponse.json({ ok: true, applicationId: result.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "An active application already exists for this NIC." },
        { status: 409 },
      );
    }
    const msg = e instanceof Error ? e.message : "Could not submit application.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
