"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { hashPassword } from "@/lib/auth";

export type ActionResult =
  | { ok: true; tempPassword?: string; email?: string }
  | { ok: false; error: string };

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function generateTempPassword(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `WU-${hex}!`;
}

export async function createSupervisor(form: FormData): Promise<ActionResult> {
  await requireRole("MAIN_ADMIN");
  const name = str(form, "name");
  if (!name) return { ok: false, error: "Supervisor name is required." };

  const email = str(form, "email").toLowerCase();
  if (!email) return { ok: false, error: "Supervisor email is required." };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  try {
    await prisma.$transaction(async (tx) => {
      const profile = await tx.supervisorProfile.create({
        data: {
          name,
          title: str(form, "title") || null,
          university: str(form, "university") || null,
          telephone: str(form, "telephone") || null,
        },
      });

      const user = await tx.portalUser.create({
        data: {
          fullName: name,
          email,
          passwordHash,
          role: "SUPERVISOR",
          mustChangePassword: true,
          initialPassword: tempPassword,
        },
      });

      await tx.supervisorProfile.update({
        where: { id: profile.id },
        data: { userId: user.id },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A user with that email already exists." };
    }
    return { ok: false, error: "Could not create supervisor account." };
  }

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
