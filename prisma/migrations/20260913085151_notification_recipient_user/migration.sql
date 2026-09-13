-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "recipient_user_id" INTEGER;

-- CreateIndex
CREATE INDEX "notification_recipient_user_id_is_read_idx" ON "notification"("recipient_user_id", "is_read");

-- CreateIndex
CREATE INDEX "notification_supervisor_id_is_read_idx" ON "notification"("supervisor_id", "is_read");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
