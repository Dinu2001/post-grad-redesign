import { prisma } from "@/lib/prisma";

// Loads the current student's approved application together with their proposal,
// supervisors and submitted progress reports.
export async function getStudentApplication(userId: number) {
  return prisma.applicationPostGraduate.findFirst({
    where: { userId, status: "APPROVED" },
    orderBy: { id: "desc" },
    include: {
      researchProposals: {
        include: {
          degreeSought: true,
          supervisors: {
            include: { supervisor: true },
            orderBy: { isMain: "desc" },
          },
          progressReports: {
            include: {
              files: true,
              reviews: {
                include: { supervisor: true },
                orderBy: { reviewedAt: "desc" },
              },
            },
            orderBy: { submittedAt: "desc" },
          },
        },
      },
    },
  });
}

export type StudentApplication = NonNullable<
  Awaited<ReturnType<typeof getStudentApplication>>
>;
