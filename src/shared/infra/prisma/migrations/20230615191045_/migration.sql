/*
  Warnings:

  - You are about to drop the `InvitesOnUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InvitesOnUsers" DROP CONSTRAINT "InvitesOnUsers_inviteId_fkey";

-- DropForeignKey
ALTER TABLE "InvitesOnUsers" DROP CONSTRAINT "InvitesOnUsers_userId_fkey";

-- AlterTable
ALTER TABLE "invite" ADD COLUMN     "guests" TEXT;

-- DropTable
DROP TABLE "InvitesOnUsers";

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_guests_fkey" FOREIGN KEY ("guests") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
