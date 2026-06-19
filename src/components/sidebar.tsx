"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@prisma/client";
import { ROLE_LABELS, ROLE_NAV } from "@/lib/roles";

type Props = {
  role: UserRole;
  fullName: string;
  email: string;
};

export function Sidebar({ role, fullName, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const links = ROLE_NAV[role];
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black">
          <span className="text-sm font-bold">WU</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-black">Postgraduate Portal</p>
          <p className="text-xs text-neutral-500">{ROLE_LABELS[role]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== ROLE_NAV[role][0].href &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-black text-white"
                  : "text-neutral-700 hover:bg-muted hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-semibold text-black">{fullName}</p>
          <p className="truncate text-xs text-neutral-500">{email}</p>
        </div>
        <Link
          href="/account/password"
          className={`mb-2 block rounded-md px-3 py-2 text-sm font-medium transition ${
            pathname === "/account/password"
              ? "bg-black text-white"
              : "text-neutral-700 hover:bg-muted hover:text-black"
          }`}
        >
          Change password
        </Link>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="w-full rounded-md border border-black px-3 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:opacity-50"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
