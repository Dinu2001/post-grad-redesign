"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { getStudentApplication } from "@/lib/student";
import { progressSchedule, windowStatus, canSubmit } from "@/lib/progress";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitProgressReport(input: {
  periodKey: string;
  description: string;
  file: { path: string; fileName: string };
}): Promise<SubmitResult> {
  const session = await requireRole("STUDENT");

  if (!input.file?.path) {
    return { ok: false, error: "Please attach your progress report file." };
  }

  const app = await getStudentApplication(session.userId);
  const proposal = app?.researchProposals[0];
  if (!app || !proposal) {
    return { ok: false, error: "No approved application found." };
  }

  // The period must be a real window in this student's schedule, and open/late.
  const schedule = progressSchedule(
    proposal.degreeSought.level,
    app.studyMode,
    app.programStartYear,
  );
  const win = schedule.find((w) => w.periodKey === input.periodKey);
  if (!win) {
    return { ok: false, error: "Invalid submission window." };
  }

  const submittedKeys = new Set(
    proposal.progressReports
      .map((r) => r.periodKey)
      .filter((k): k is string => Boolean(k)),
  );
  if (submittedKeys.has(win.periodKey)) {
    return { ok: false, error: "You have already submitted this report." };
  }

  const status = windowStatus(win, new Date(), submittedKeys);
  if (!canSubmit(status)) {
    return { ok: false, error: "This submission window is not open yet." };
  }

  await prisma.progressReport.create({
    data: {
      proposalId: proposal.id,
      periodKey: win.periodKey,
      title: win.label,
      description: input.description.trim() || null,
      files: {
        create: [
          { originalFileName: input.file.fileName, filePath: input.file.path },
        ],
      },
    },
  });

  revalidatePath("/student/progress");
  revalidatePath("/student");
  return { ok: true };
}
