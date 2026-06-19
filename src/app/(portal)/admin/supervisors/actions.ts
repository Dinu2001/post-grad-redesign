"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export type ActionResult = { ok: true } | { ok: false; error: string };

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

export async function createSupervisor(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const name = str(form, "name");
  if (!name) return { ok: false, error: "Supervisor name is required." };

  await prisma.supervisorProfile.create({
    data: {
      name,
      title: str(form, "title") || null,
      university: str(form, "university") || null,
      telephone: str(form, "telephone") || null,
    },
  });
  revalidatePath("/admin/supervisors");
  return { ok: true };
}

export async function updateSupervisor(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const id = Number(form.get("id"));
  const name = str(form, "name");
  if (!id || !name) return { ok: false, error: "Supervisor name is required." };

  await prisma.supervisorProfile.update({
    where: { id },
    data: {
      name,
      title: str(form, "title") || null,
      university: str(form, "university") || null,
      telephone: str(form, "telephone") || null,
    },
  });
  revalidatePath("/admin/supervisors");
  return { ok: true };
}

export async function deleteSupervisor(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const id = Number(form.get("id"));
  if (!id) return { ok: false, error: "Invalid supervisor." };

  try {
    await prisma.supervisorProfile.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return {
        ok: false,
        error: "This supervisor is used in an application and cannot be deleted.",
      };
    }
    return { ok: false, error: "Could not delete supervisor." };
  }
  revalidatePath("/admin/supervisors");
  return { ok: true };
}
