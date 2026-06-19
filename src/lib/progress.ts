import type { DegreeLevel, StudyMode } from "@prisma/client";
import { durationYears } from "@/lib/duration";

// A single progress-report submission window. Two windows per programme year:
//   H1: Jan 1 – Jun 30   ·   H2: Jul 1 – Dec 31
export type ReportWindow = {
  index: number; // 1-based, across the whole programme
  programmeYear: number; // 1..duration
  half: 1 | 2;
  calendarYear: number;
  periodKey: string; // e.g. "2026-H1"
  label: string; // e.g. "Year 1 · Jan–Jun 2026"
  windowStart: Date;
  windowEnd: Date;
};

export type WindowStatus = "submitted" | "open" | "upcoming" | "overdue";

export function progressSchedule(
  level: DegreeLevel,
  mode: StudyMode | null,
  startYear: number | null,
): ReportWindow[] {
  if (!mode || !startYear) return [];
  const years = durationYears(level, mode);
  if (!years) return [];

  const windows: ReportWindow[] = [];
  let index = 1;
  for (let y = 0; y < years; y++) {
    const cal = startYear + y;
    windows.push({
      index: index++,
      programmeYear: y + 1,
      half: 1,
      calendarYear: cal,
      periodKey: `${cal}-H1`,
      label: `Year ${y + 1} · Jan–Jun ${cal}`,
      windowStart: new Date(Date.UTC(cal, 0, 1)),
      windowEnd: new Date(Date.UTC(cal, 5, 30, 23, 59, 59)),
    });
    windows.push({
      index: index++,
      programmeYear: y + 1,
      half: 2,
      calendarYear: cal,
      periodKey: `${cal}-H2`,
      label: `Year ${y + 1} · Jul–Dec ${cal}`,
      windowStart: new Date(Date.UTC(cal, 6, 1)),
      windowEnd: new Date(Date.UTC(cal, 11, 31, 23, 59, 59)),
    });
  }
  return windows;
}

// Status of a window given "now" and the set of already-submitted period keys.
export function windowStatus(
  w: ReportWindow,
  now: Date,
  submitted: Set<string>,
): WindowStatus {
  if (submitted.has(w.periodKey)) return "submitted";
  if (now < w.windowStart) return "upcoming";
  if (now > w.windowEnd) return "overdue";
  return "open";
}

// The student may submit once the window has opened (open or late/overdue).
export function canSubmit(status: WindowStatus): boolean {
  return status === "open" || status === "overdue";
}
