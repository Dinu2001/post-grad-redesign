import { prisma } from "@/lib/prisma";

export type SupervisorReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReportSupervisorRow = {
  supervisorName: string;
  isMain: boolean;
  status: SupervisorReviewStatus;
  comment: string | null;
  reviewedAt: string | null;
};

export type ProgressReportRow = {
  id: number;
  title: string;
  submittedAt: string;
  fileName: string | null;
  filePath: string | null;
  supervisors: ReportSupervisorRow[];
  allApproved: boolean;
};

export type StudentProgressRow = {
  applicationId: number;
  studentName: string;
  faculty: string | null;
  degreeProgram: string | null;
  status: string;
  proposalTitle: string | null;
  supervisorNames: string[];
  presentation: {
    title: string;
    date: string;
    isDone: boolean;
    isFinal: boolean;
  } | null;
  reports: ProgressReportRow[];
};

/**
 * Student-wise progress overview for admins. When `facultyName` is provided the
 * result is scoped to that faculty (for faculty admins); otherwise all faculties
 * (for the main/dean admin).
 */
export async function getStudentProgressOverview(
  facultyName?: string | null,
): Promise<StudentProgressRow[]> {
  const apps = await prisma.applicationPostGraduate.findMany({
    where: {
      ...(facultyName ? { faculty: facultyName } : {}),
      researchProposals: { some: {} },
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      faculty: true,
      degreeProgram: true,
      status: true,
      researchProposals: {
        take: 1,
        orderBy: { id: "desc" },
        select: {
          title: true,
          supervisors: {
            orderBy: { isMain: "desc" },
            select: {
              isMain: true,
              supervisor: { select: { name: true } },
            },
          },
          presentations: {
            orderBy: { presentationDate: "desc" },
            take: 1,
            select: {
              title: true,
              presentationDate: true,
              isDone: true,
              isFinal: true,
            },
          },
          progressReports: {
            orderBy: { submittedAt: "desc" },
            select: {
              id: true,
              title: true,
              submittedAt: true,
              completedAt: true,
              files: { take: 1, select: { originalFileName: true, filePath: true } },
              reviews: {
                select: {
                  status: true,
                  comment: true,
                  reviewedAt: true,
                  supervisor: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return apps.map((app): StudentProgressRow => {
    const proposal = app.researchProposals[0];
    const supervisorLinks = proposal?.supervisors ?? [];
    const presentation = proposal?.presentations[0] ?? null;

    const reports: ProgressReportRow[] = (proposal?.progressReports ?? []).map((r) => {
      // One row per assigned supervisor, filled from their review if present.
      const byName = new Map(
        r.reviews.map((rv) => [rv.supervisor.name, rv]),
      );
      const supervisors: ReportSupervisorRow[] = supervisorLinks.map((link) => {
        const rv = byName.get(link.supervisor.name);
        return {
          supervisorName: link.supervisor.name,
          isMain: link.isMain,
          status: (rv?.status ?? "PENDING") as SupervisorReviewStatus,
          comment: rv?.comment ?? null,
          reviewedAt: rv?.reviewedAt ? rv.reviewedAt.toISOString() : null,
        };
      });
      const allApproved =
        r.completedAt != null ||
        (supervisors.length > 0 && supervisors.every((s) => s.status === "APPROVED"));
      return {
        id: r.id,
        title: r.title,
        submittedAt: r.submittedAt.toISOString(),
        fileName: r.files[0]?.originalFileName ?? null,
        filePath: r.files[0]?.filePath ?? null,
        supervisors,
        allApproved,
      };
    });

    return {
      applicationId: app.id,
      studentName: app.fullName,
      faculty: app.faculty,
      degreeProgram: app.degreeProgram,
      status: app.status,
      proposalTitle: proposal?.title ?? null,
      supervisorNames: supervisorLinks.map((l) => l.supervisor.name),
      presentation: presentation
        ? {
            title: presentation.title,
            date: presentation.presentationDate.toISOString(),
            isDone: presentation.isDone,
            isFinal: presentation.isFinal,
          }
        : null,
      reports,
    };
  });
}
