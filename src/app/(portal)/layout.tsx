import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { NotificationBell } from "@/components/notification-bell";
import {
  listNotifications,
  supervisorIdForUser,
} from "@/lib/notify";
import { ROLE_LABELS } from "@/lib/roles";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.mustChangePassword) {
    redirect("/account/password");
  }

  const supervisorId = await supervisorIdForUser(session.userId);
  const notifications = await listNotifications(session.userId, supervisorId);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex min-h-screen flex-col bg-muted md:flex-row">
      <Sidebar
        role={session.role}
        fullName={session.fullName}
        email={session.email}
      />
      <main className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3 pl-16 sm:px-6 sm:pl-16 lg:px-8 lg:pl-8">
          <p className="text-sm font-semibold text-neutral-500">
            {ROLE_LABELS[session.role]} Portal
          </p>
          <NotificationBell items={notifications} unread={unread} />
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
