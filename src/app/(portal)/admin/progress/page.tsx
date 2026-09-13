import { requireRole } from "@/lib/guard";
import { PageHeader } from "@/components/page-header";
import { getStudentProgressOverview } from "@/lib/admin-progress";
import { ProgressMonitor } from "@/components/progress-monitor";

export const dynamic = "force-dynamic";

export default async function AdminProgressPage() {
  await requireRole("MAIN_ADMIN");
  const students = await getStudentProgressOverview();

  return (
    <>
      <PageHeader
        title="Student Progress"
        subtitle="All faculties — presentations and progress reports, student by student."
      />
      <ProgressMonitor students={students} showFaculty />
    </>
  );
}
