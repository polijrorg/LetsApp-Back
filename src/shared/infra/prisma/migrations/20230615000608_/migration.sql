/*
  Warnings:

  - You are about to drop the column `inviteId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_inviteId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "inviteId";

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
