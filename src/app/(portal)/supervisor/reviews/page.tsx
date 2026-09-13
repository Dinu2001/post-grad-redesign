import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { progressSchedule, windowStatus } from "@/lib/progress";
import { ReviewsClient, type StudentCard } from "./reviews-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireRole("SUPERVISOR");
  const supervisor = await prisma.supervisorProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!supervisor) {
    return null;
  }

  const proposals = await prisma.researchProposal.findMany({
    where: { supervisors: { some: { supervisorId: supervisor.id } } },
    select: {
      id: true,
      title: true,
      degreeSought: { select: { level: true } },
      application: {
        select: { fullName: true, studyMode: true, programStartYear: true },
      },
      supervisors: {
        where: { supervisorId: supervisor.id },
        select: { isMain: true },
      },
      progressReports: {
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          title: true,
          periodKey: true,
          description: true,
          submittedAt: true,
          files: { select: { originalFileName: true, filePath: true }, take: 1 },
          reviews: {
            where: { supervisorId: supervisor.id },
            select: { status: true, comment: true, reviewedAt: true },
          },
        },
      },
    },
  });

  const now = new Date();

  const students: StudentCard[] = proposals.map((p) => {
    const reports = p.progressReports.map((r) => {
      const review = r.reviews[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        submittedAt: r.submittedAt.toISOString(),
        fileName: r.files[0]?.originalFileName ?? null,
        filePath: r.files[0]?.filePath ?? null,
        status: (review?.status ?? "PENDING") as StudentCard["reports"][number]["status"],
        comment: review?.comment ?? null,
        reviewedAt: review?.reviewedAt ? review.reviewedAt.toISOString() : null,
      };
    });

    // Determine the next report the student still has to submit.
    const submittedKeys = new Set(
      p.progressReports.map((r) => r.periodKey).filter((k): k is string => Boolean(k)),
    );
    const schedule = progressSchedule(
      p.degreeSought.level,
      p.application.studyMode,
      p.application.programStartYear,
    );
    const upcoming = schedule.find((w) => {
      const s = windowStatus(w, now, submittedKeys);
      return s === "open" || s === "upcoming" || s === "overdue";
    });

    const reviewedCount = reports.filter((r) => r.status !== "PENDING").length;

    return {
      proposalId: p.id,
      studentName: p.application.fullName,
      proposalTitle: p.title,
      isMain: p.supervisors[0]?.isMain ?? false,
      reports,
      submittedCount: reports.length,
      reviewedCount,
      pendingCount: reports.length - reviewedCount,
      nextDue: upcoming
        ? { label: upcoming.label, date: upcoming.windowStart.toISOString() }
        : null,
    };
  });

  students.sort((a, b) => a.studentName.localeCompare(b.studentName));

  return (
    <>
      <PageHeader
        title="Progress Review"
        subtitle="Your students, their submitted progress reports and reviews."
      />
      <ReviewsClient students={students} />
    </>
  );
}
