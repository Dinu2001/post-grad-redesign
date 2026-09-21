"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
});

export type ProfileActionResult =
  | { ok: true; fullName: string; email: string }
  | { ok: false; error: string };

export async function updateProfile(form: FormData): Promise<ProfileActionResult> {
  const session = await requireRole([
    "STUDENT",
    "SUPERVISOR",
    "MAIN_ADMIN",
    "FACULTY_ADMIN",
    "REGISTRAR",
  ]);

  const parsed = profileSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const fullName = parsed.data.fullName;
  const email = parsed.data.email.toLowerCase();

  try {
    const user = await prisma.portalUser.update({
      where: { id: session.userId },
      data: { fullName, email },
      select: { id: true, role: true, mustChangePassword: true },
    });

    await createSession({
      userId: user.id,
      email,
      role: user.role,
      fullName,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "That email address is already in use." };
    }
    console.error("Profile update failed", error);
    return { ok: false, error: "Could not update your profile." };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true, fullName, email };
}
