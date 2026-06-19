import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getSession, type SessionPayload } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

// Ensures the current session matches one of the allowed roles. Redirects to
// /login when unauthenticated, or to the user's own home when role mismatches.
export async function requireRole(
  allowed: UserRole | UserRole[],
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");

  const roles = Array.isArray(allowed) ? allowed : [allowed];
  if (!roles.includes(session.role)) {
    redirect(ROLE_HOME[session.role]);
  }
  return session;
}
