import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: faculty → department → degree tree for the registration dropdowns.
export async function GET() {
  const faculties = await prisma.faculty.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      departments: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          degrees: {
            orderBy: { name: "asc" },
            select: { id: true, name: true, level: true, type: true, studyModes: true },
          },
        },
      },
    },
  });
  return NextResponse.json({ faculties });
}
