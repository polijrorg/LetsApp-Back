/*
  Warnings:

  - You are about to drop the column `guestId` on the `invite` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_guestId_fkey";

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "guestId",
ADD COLUMN     "guests" TEXT;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_guests_fkey" FOREIGN KEY ("guests") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
