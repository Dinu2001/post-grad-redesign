import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StructureManager, type FacultyNode } from "./structure-manager";

export default async function StructurePage() {
  await requireRole("MAIN_ADMIN");

  const faculties = await prisma.faculty.findMany({
    orderBy: { name: "asc" },
    include: {
      departments: {
        orderBy: { name: "asc" },
        include: {
          degrees: {
            orderBy: { name: "asc" },
            select: { id: true, name: true, level: true, type: true, studyModes: true },
          },
        },
      },
    },
  });

  const data: FacultyNode[] = faculties.map((f) => ({
    id: f.id,
    name: f.name,
    departments: f.departments.map((d) => ({
      id: d.id,
      name: d.name,
      degrees: d.degrees,
    })),
  }));

  return (
    <>
      <PageHeader
        title="Faculties & Degrees"
        subtitle="Manage the faculty → department → degree structure used in student registration."
      />
      <StructureManager faculties={data} />
    </>
  );
}
