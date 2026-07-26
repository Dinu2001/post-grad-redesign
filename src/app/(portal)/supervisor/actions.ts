"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitSupervisorReview(form: FormData): Promise<ActionResult> {
  const session = await requireRole("SUPERVISOR");

  const progressId = Number(form.get("progressId"));
  const status = String(form.get("status") ?? "");
  const comment = String(form.get("comment") ?? "").trim();

  if (!progressId || !["APPROVED", "REJECTED"].includes(status)) {
    return { ok: false, error: "Invalid review request." };
  }

  const supervisor = await prisma.supervisorProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!supervisor) {
    return { ok: false, error: "Supervisor profile was not found." };
  }

  const report = await prisma.progressReport.findUnique({
    where: { id: progressId },
    select: {
      id: true,
      proposal: {
        select: {
          supervisors: { select: { supervisorId: true } },
        },
      },
    },
  });

  if (!report) {
    return { ok: false, error: "Progress report was not found." };
  }

  const isAssigned = report.proposal.supervisors.some(
    (item) => item.supervisorId === supervisor.id,
  );
  if (!isAssigned) {
    return { ok: false, error: "You are not assigned to this student." };
  }

  const existing = await prisma.supervisorProgressReview.findFirst({
    where: {
      progressId,
      supervisorId: supervisor.id,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.supervisorProgressReview.update({
      where: { id: existing.id },
      data: {
        status: status === "APPROVED" ? "APPROVED" : "REJECTED",
        comment: comment || null,
        reviewedAt: new Date(),
      },
    });
  } else {
    await prisma.supervisorProgressReview.create({
      data: {
        progressId,
        supervisorId: supervisor.id,
        status: status === "APPROVED" ? "APPROVED" : "REJECTED",
        comment: comment || null,
        reviewedAt: new Date(),
      },
    });
  }

  revalidatePath("/supervisor/reviews");
  revalidatePath("/supervisor");
  revalidatePath("/student/progress");
  return { ok: true };
}
