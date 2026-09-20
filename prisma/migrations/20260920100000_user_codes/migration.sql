-- Add human-readable identifiers while keeping user_id as the internal key.
CREATE SEQUENCE "student_user_code_seq";
CREATE SEQUENCE "staff_user_code_seq";

ALTER TABLE "user" ADD COLUMN "user_code" TEXT;

WITH numbered AS (
  SELECT
    "user_id",
    "role",
    ROW_NUMBER() OVER (
      PARTITION BY CASE WHEN "role" = 'STUDENT' THEN 'STUDENT' ELSE 'STAFF' END
      ORDER BY "user_id"
    ) AS code_number
  FROM "user"
)
UPDATE "user" AS u
SET "user_code" = CASE
  WHEN numbered."role" = 'STUDENT' THEN 'STU' || LPAD(numbered.code_number::text, 4, '0')
  ELSE 'STAFF' || LPAD(numbered.code_number::text, 3, '0')
END
FROM numbered
WHERE u."user_id" = numbered."user_id";

SELECT setval('student_user_code_seq', COALESCE((
  SELECT COUNT(*) FROM "user" WHERE "role" = 'STUDENT'
), 0) + 1, false);
SELECT setval('staff_user_code_seq', COALESCE((
  SELECT COUNT(*) FROM "user" WHERE "role" <> 'STUDENT'
), 0) + 1, false);

ALTER TABLE "user" ALTER COLUMN "user_code" SET NOT NULL;
CREATE UNIQUE INDEX "user_user_code_key" ON "user"("user_code");