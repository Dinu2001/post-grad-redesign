"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recipientWhere, supervisorIdForUser } from "@/lib/notify";

/** Mark a single notification read (only if it belongs to the current user). */
export async function markNotificationRead(id: number): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const supervisorId = await supervisorIdForUser(session.userId);
  await prisma.notification.updateMany({
    where: { id, ...recipientWhere(session.userId, supervisorId) },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}

/** Mark every notification visible to the current user as read. */
export async function markAllNotificationsRead(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const supervisorId = await supervisorIdForUser(session.userId);
  await prisma.notification.updateMany({
    where: { isRead: false, ...recipientWhere(session.userId, supervisorId) },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}
