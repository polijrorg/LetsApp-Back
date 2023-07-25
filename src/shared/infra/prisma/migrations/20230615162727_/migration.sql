/*
  Warnings:

  - You are about to drop the column `inviteId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_inviteId_fkey";

-- AlterTable
ALTER TABLE "invite" ADD COLUMN     "guestId" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "inviteId";

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
