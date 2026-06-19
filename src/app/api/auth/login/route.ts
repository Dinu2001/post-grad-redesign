import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.portalUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Generic message — do not reveal whether the email exists.
  const invalid = NextResponse.json(
    { error: "Invalid email or password." },
    { status: 401 },
  );

  if (!user || !user.passwordHash) return invalid;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return invalid;

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    mustChangePassword: user.mustChangePassword,
  });

  const home = user.mustChangePassword
    ? "/account/password"
    : ROLE_HOME[user.role];

  return NextResponse.json({ ok: true, home });
}
