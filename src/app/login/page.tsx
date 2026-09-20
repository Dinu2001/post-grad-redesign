import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role]);
  }

  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div
        aria-hidden
        className="login-background pointer-events-none absolute inset-0"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 pt-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur ring-1 ring-white/30">
            <span className="text-lg font-bold tracking-tight">WU</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Postgraduate Portal
          </h1>
          <p className="mt-1 text-sm text-white/80">
            University of Wayamba — sign in to continue
          </p>
        </div>

        <div className="card-shadow rounded-2xl border border-border bg-white p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          New postgraduate applicant?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand underline underline-offset-4"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
