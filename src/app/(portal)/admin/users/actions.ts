"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { hashPassword } from "@/lib/auth";

export type CreateUserResult =
  | { ok: true; tempPassword: string; email: string }
  | { ok: false; error: string };

// Staff roles a Main Admin can provision directly. Students are created by the
// Registrar on approval; supervisors are handled via the registration flow.
const STAFF_ROLES: UserRole[] = ["MAIN_ADMIN", "FACULTY_ADMIN", "REGISTRAR"];

function generateTempPassword(): string {
  // Readable temporary password: WU- + 8 hex chars + ! (no Math.random needed
  // at module scope; derive from time + counter via crypto).
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `WU-${hex}!`;
}

export async function createStaffUser(
  form: FormData,
): Promise<CreateUserResult> {
  await requireRole("MAIN_ADMIN");

  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(form.get("role") ?? "") as UserRole;
  const facultyId = form.get("facultyId") ? Number(form.get("facultyId")) : null;

  if (!fullName || !email) {
    return { ok: false, error: "Full name and email are required." };
  }
  if (!STAFF_ROLES.includes(role)) {
    return { ok: false, error: "Invalid role." };
  }
  if (role === "FACULTY_ADMIN" && !facultyId) {
    return { ok: false, error: "Select a faculty for the faculty admin." };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.portalUser.create({
        data: {
          fullName,
          email,
          passwordHash,
          role,
          mustChangePassword: true,
        },
      });

      if (role === "MAIN_ADMIN") {
        await tx.adminProfile.create({ data: { userId: user.id } });
      } else if (role === "REGISTRAR") {
        await tx.registrarProfile.create({ data: { userId: user.id } });
      } else if (role === "FACULTY_ADMIN") {
        const faculty = await tx.faculty.findUnique({
          where: { id: facultyId! },
        });
        await tx.facultyAdminProfile.create({
          data: {
            userId: user.id,
            faculty: faculty?.name ?? "",
            facultyId: facultyId!,
          },
        });
      }
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A user with that email already exists." };
    }
    return { ok: false, error: "Could not create user." };
  }

  revalidatePath("/admin/users");
  return { ok: true, tempPassword, email };
}
