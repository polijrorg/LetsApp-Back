/*
  Warnings:

  - You are about to drop the `_InviteToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `inviteId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_InviteToUser" DROP CONSTRAINT "_InviteToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_InviteToUser" DROP CONSTRAINT "_InviteToUser_B_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "inviteId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_InviteToUser";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
