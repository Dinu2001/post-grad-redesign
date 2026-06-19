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
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black">
            <span className="text-lg font-bold tracking-tight">WU</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Postgraduate Portal
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            University of Wayamba — sign in to continue
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          New postgraduate applicant?{" "}
          <Link
            href="/register"
            className="font-semibold text-black underline underline-offset-4"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
