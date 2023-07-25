-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_guests_fkey";

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_guests_fkey" FOREIGN KEY ("guests") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
