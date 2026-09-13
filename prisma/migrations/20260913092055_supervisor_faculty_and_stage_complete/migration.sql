-- AlterTable
ALTER TABLE "progress_report" ADD COLUMN     "completed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "supervisor" ADD COLUMN     "faculty_id" INTEGER;

-- AddForeignKey
ALTER TABLE "supervisor" ADD CONSTRAINT "supervisor_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("faculty_id") ON DELETE SET NULL ON UPDATE CASCADE;
