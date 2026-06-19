import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  getSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const user = await prisma.portalUser.findUnique({
    where: { id: session.userId },
  });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.portalUser.update({
    where: { id: user.id },
    // Clear the retained temp password once the student sets their own.
    data: { passwordHash: newHash, mustChangePassword: false, initialPassword: null },
  });

  // Refresh the session so mustChangePassword is cleared.
  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    mustChangePassword: false,
  });

  return NextResponse.json({ ok: true });
}
