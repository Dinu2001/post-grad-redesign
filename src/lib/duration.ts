import type { DegreeLevel, StudyMode } from "@prisma/client";

// Programme duration in years, by degree level and study mode:
//   PhD   full-time → 3   | PhD   part-time → 5
//   MPhil full-time → 2   | MPhil part-time → 3
// Returns null when it cannot be determined (e.g. OTHER level).
export function durationYears(
  level: DegreeLevel,
  mode: StudyMode,
): number | null {
  if (level === "PHD") return mode === "FULL_TIME" ? 3 : 5;
  if (level === "MPHIL") return mode === "FULL_TIME" ? 2 : 3;
  return null;
}

export function durationLabel(
  level: DegreeLevel,
  mode: StudyMode,
): string {
  const years = durationYears(level, mode);
  if (years == null) return "Duration set by faculty";
  return `${years} year${years === 1 ? "" : "s"}`;
}
