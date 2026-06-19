-- AlterTable
ALTER TABLE "degree_sought" ADD COLUMN     "study_modes" "StudyMode"[];

-- Backfill existing degrees with both study modes so they remain selectable.
UPDATE "degree_sought"
  SET "study_modes" = ARRAY['FULL_TIME', 'PART_TIME']::"StudyMode"[]
  WHERE "study_modes" IS NULL;
