/**
 * In-app notification helpers. Notifications target either a portal user
 * (recipientUserId — students, faculty admins, registrars, main admins) or a
 * supervisor profile (supervisorId — supervisors may not have an account yet,
 * but a linked user account is required to actually see the panel).
 *
 * A Prisma transaction client can be passed in so notifications are written
 * inside the same transaction as the event that triggered them.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

type Db = PrismaClient | Prisma.TransactionClient;

type NotifyInput = {
  title: string;
  message: string;
  applicationId?: number | null;
};

/** Notify a single portal user by user id. */
export async function notifyUser(
  userId: number,
  input: NotifyInput,
  db: Db = prisma,
): Promise<void> {
  await db.notification.create({
    data: {
      title: input.title,
      message: input.message,
      applicationId: input.applicationId ?? null,
      recipientUserId: userId,
    },
  });
}

/** Notify a supervisor by supervisor profile id. */
export async function notifySupervisor(
  supervisorId: number,
  input: NotifyInput,
  db: Db = prisma,
): Promise<void> {
  await db.notification.create({
    data: {
      title: input.title,
      message: input.message,
      applicationId: input.applicationId ?? null,
      supervisorId,
    },
  });
}

/** Notify every user holding a given role (e.g. all registrars). */
export async function notifyRole(
  role: "REGISTRAR" | "MAIN_ADMIN" | "FACULTY_ADMIN",
  input: NotifyInput,
  db: Db = prisma,
): Promise<void> {
  const users = await db.portalUser.findMany({
    where: { role },
    select: { id: true },
  });
  if (users.length === 0) return;
  await db.notification.createMany({
    data: users.map((u) => ({
      title: input.title,
      message: input.message,
      applicationId: input.applicationId ?? null,
      recipientUserId: u.id,
    })),
  });
}

/** Notify the faculty admin(s) responsible for a faculty (matched by name). */
export async function notifyFacultyAdmins(
  facultyName: string | null | undefined,
  input: NotifyInput,
  db: Db = prisma,
): Promise<void> {
  if (!facultyName) return;
  const admins = await db.facultyAdminProfile.findMany({
    where: { faculty: facultyName },
    select: { userId: true },
  });
  if (admins.length === 0) return;
  await db.notification.createMany({
    data: admins.map((a) => ({
      title: input.title,
      message: input.message,
      applicationId: input.applicationId ?? null,
      recipientUserId: a.userId,
    })),
  });
}

/** The supervisor profile id linked to a user, or null if none. */
export async function supervisorIdForUser(userId: number): Promise<number | null> {
  const sup = await prisma.supervisorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return sup?.id ?? null;
}

/** Prisma `where` matching notifications visible to a user + supervisor profile. */
export function recipientWhere(userId: number, supervisorId: number | null) {
  return {
    OR: [
      { recipientUserId: userId },
      ...(supervisorId ? [{ supervisorId }] : []),
    ],
  };
}

/** Count unread notifications visible to a user (their user id + supervisor profile). */
export async function unreadCount(
  userId: number,
  supervisorId: number | null,
): Promise<number> {
  return prisma.notification.count({
    where: { isRead: false, ...recipientWhere(userId, supervisorId) },
  });
}

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

/** Recent notifications visible to a user + supervisor profile. */
export async function listNotifications(
  userId: number,
  supervisorId: number | null,
  limit = 20,
): Promise<NotificationItem[]> {
  return prisma.notification.findMany({
    where: recipientWhere(userId, supervisorId),
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  });
}
