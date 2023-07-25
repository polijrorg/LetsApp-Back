/*
  Warnings:

  - You are about to drop the column `guests` on the `invite` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_guests_fkey";

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "guests";

-- CreateTable
CREATE TABLE "InvitesOnUsers" (
    "inviteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InvitesOnUsers_pkey" PRIMARY KEY ("inviteId","userId")
);

-- AddForeignKey
ALTER TABLE "InvitesOnUsers" ADD CONSTRAINT "InvitesOnUsers_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitesOnUsers" ADD CONSTRAINT "InvitesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
