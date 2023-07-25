/*
  Warnings:

  - You are about to drop the column `guests` on the `invite` table. All the data in the column will be lost.
  - You are about to drop the column `invitephone` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_guests_fkey";

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "guests";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "invitephone";

-- CreateTable
CREATE TABLE "_InviteToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InviteToUser_AB_unique" ON "_InviteToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_InviteToUser_B_index" ON "_InviteToUser"("B");

-- AddForeignKey
ALTER TABLE "_InviteToUser" ADD CONSTRAINT "_InviteToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InviteToUser" ADD CONSTRAINT "_InviteToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
