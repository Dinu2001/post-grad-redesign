"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type DegreeLevel, type StudyMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export type ActionResult = { ok: true } | { ok: false; error: string };

const LEVELS: DegreeLevel[] = ["MPHIL", "PHD", "OTHER"];

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

// ---- Faculty -------------------------------------------------------------

export async function createFaculty(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const name = str(form, "name");
  if (!name) return { ok: false, error: "Faculty name is required." };
  try {
    await prisma.faculty.create({ data: { name } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A faculty with that name already exists." };
    }
    return { ok: false, error: "Could not create faculty." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}

export async function renameFaculty(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const id = Number(form.get("id"));
  const name = str(form, "name");
  if (!id || !name) return { ok: false, error: "Faculty name is required." };
  try {
    await prisma.faculty.update({ where: { id }, data: { name } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A faculty with that name already exists." };
    }
    return { ok: false, error: "Could not rename faculty." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}

export async function deleteFaculty(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const id = Number(form.get("id"));
  if (!id) return { ok: false, error: "Invalid faculty." };
  try {
    await prisma.faculty.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return {
        ok: false,
        error: "Remove its departments first before deleting this faculty.",
      };
    }
    return { ok: false, error: "Could not delete faculty." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}

// ---- Department ----------------------------------------------------------

export async function createDepartment(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const facultyId = Number(form.get("facultyId"));
  const name = str(form, "name");
  if (!facultyId || !name)
    return { ok: false, error: "Department name is required." };
  try {
    await prisma.department.create({ data: { name, facultyId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        error: "That department already exists in this faculty.",
      };
    }
    return { ok: false, error: "Could not create department." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}

export async function deleteDepartment(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const id = Number(form.get("id"));
  if (!id) return { ok: false, error: "Invalid department." };
  try {
    await prisma.department.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete department." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}

// ---- Degree --------------------------------------------------------------

export async function createDegree(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const departmentId = Number(form.get("departmentId"));
  const name = str(form, "name");
  const type = str(form, "type") || null;
  const levelRaw = str(form, "level");
  const level = (LEVELS.includes(levelRaw as DegreeLevel)
    ? levelRaw
    : "OTHER") as DegreeLevel;
  if (!departmentId || !name)
    return { ok: false, error: "Degree name is required." };

  const studyModes: StudyMode[] = [];
  if (form.get("fullTime")) studyModes.push("FULL_TIME");
  if (form.get("partTime")) studyModes.push("PART_TIME");
  if (studyModes.length === 0)
    return { ok: false, error: "Select at least one study mode (Full time / Part time)." };

  const dept = await prisma.department.findUnique({
    where: { id: departmentId },
    include: { faculty: true },
  });
  if (!dept) return { ok: false, error: "Department not found." };

  try {
    await prisma.degreeSought.create({
      data: {
        name,
        type,
        level,
        studyModes,
        departmentId,
        department: dept.name,
        faculty: dept.faculty.name,
      },
    });
  } catch {
    return { ok: false, error: "Could not create degree." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}

export async function deleteDegree(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const id = Number(form.get("id"));
  if (!id) return { ok: false, error: "Invalid degree." };
  try {
    await prisma.degreeSought.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return {
        ok: false,
        error: "This degree is referenced by a proposal and cannot be deleted.",
      };
    }
    return { ok: false, error: "Could not delete degree." };
  }
  revalidatePath("/admin/structure");
  return { ok: true };
}
