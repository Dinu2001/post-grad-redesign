import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";
import { PasswordForm } from "./password-form";

export default async function PasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Change your password
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {session.mustChangePassword
              ? "For security, set a new password before continuing."
              : "Update your account password."}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <PasswordForm mustChange={session.mustChangePassword} role={session.role} />
        </div>
        {!session.mustChangePassword && (
          <p className="mt-4 text-center text-sm">
            <Link
              href={ROLE_HOME[session.role]}
              className="text-neutral-500 underline underline-offset-4"
            >
              ← Back to dashboard
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
