import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { getStudentProgressOverview } from "@/lib/admin-progress";
import { ProgressMonitor } from "@/components/progress-monitor";

export const dynamic = "force-dynamic";

export default async function FacultyAdminProgressPage() {
  const session = await requireRole("FACULTY_ADMIN");
  const profile = await prisma.facultyAdminProfile.findUnique({
    where: { userId: session.userId },
    select: { faculty: true },
  });

  const students = await getStudentProgressOverview(profile?.faculty ?? null);

  return (
    <>
      <PageHeader
        title="Student Progress"
        subtitle={
          profile?.faculty
            ? `${profile.faculty} — presentations and progress reports, student by student.`
            : "Presentations and progress reports, student by student."
        }
      />
      <ProgressMonitor students={students} />
    </>
  );
}
