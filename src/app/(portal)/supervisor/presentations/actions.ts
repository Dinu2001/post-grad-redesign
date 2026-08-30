"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export type MarkPresentationDoneResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Supervisor marks a presentation as completed.
 * This indicates the presentation has taken place and the supervisor has assessed it.
 */
export async function markPresentationDone(
  presentationId: number,
): Promise<MarkPresentationDoneResult> {
  const session = await requireRole("SUPERVISOR");

  const presentation = await prisma.presentation.findUnique({
    where: { id: presentationId },
    include: {
      proposal: {
        select: {
          supervisors: {
            select: { supervisorId: true },
          },
          application: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  if (!presentation) {
    return { ok: false, error: "Presentation not found." };
  }

  const supervisor = await prisma.supervisorProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!supervisor) {
    return { ok: false, error: "Supervisor profile not found." };
  }

  // Verify supervisor is assigned to this proposal
  const isAssigned = presentation.proposal.supervisors.some(
    (s) => s.supervisorId === supervisor.id
  );

  if (!isAssigned) {
    return {
      ok: false,
      error: "You are not assigned as a supervisor for this student.",
    };
  }

  if (presentation.isDone) {
    return {
      ok: false,
      error: "This presentation has already been marked as completed.",
    };
  }

  try {
    await prisma.presentation.update({
      where: { id: presentationId },
      data: { isDone: true },
    });

    // Create notification for registrar
    await prisma.notification.create({
      data: {
        title: "Presentation Completed",
        message: `Presentation for ${presentation.proposal.application.fullName} has been marked as completed and is awaiting your review.`,
        adminId: 1, // TODO: Get current admin's ID or notify all admins
      },
    });

    revalidatePath("/supervisor/presentations");
    return { ok: true };
  } catch (error) {
    console.error("Error marking presentation as done:", error);
    return { ok: false, error: "Failed to update presentation status." };
  }
}
