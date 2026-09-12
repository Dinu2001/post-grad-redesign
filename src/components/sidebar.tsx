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

/* Minimal inline icons keyed by nav label keyword. */
function NavIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const common = "h-4 w-4";
  if (l.includes("dashboard"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    );
  if (l.includes("application") || l.includes("registration"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M8 12h8M8 16h5" />
      </svg>
    );
  if (l.includes("proposal") || l.includes("progress") || l.includes("review"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 3 3 5-6" />
      </svg>
    );
  if (l.includes("presentation"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M12 16v4M8 20h8" />
      </svg>
    );
  if (l.includes("student") || l.includes("user") || l.includes("supervisor"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M16 5.5a3 3 0 0 1 0 5.5M21 20a5 5 0 0 0-4-4.9" />
      </svg>
    );
  if (l.includes("facult") || l.includes("degree") || l.includes("structure"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
      </svg>
    );
  if (l.includes("approved"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    );
  if (l.includes("rejected"))
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    );
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

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

  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="bg-hero-gradient flex h-screen w-64 shrink-0 flex-col text-white">
      <div className="flex items-center gap-3 border-b border-white/15 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <span className="text-sm font-bold tracking-tight">WU</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">Postgraduate Portal</p>
          <p className="text-xs text-white/70">{ROLE_LABELS[role]}</p>
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white text-brand shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <NavIcon label={link.label} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <p className="truncate text-xs text-white/60">{email}</p>
          </div>
        </div>
        <Link
          href="/account/password"
          className={`mb-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
            pathname === "/account/password"
              ? "bg-white text-brand"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Change password
        </Link>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 12H4M9 7l-5 5 5 5" />
            <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
          </svg>
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
