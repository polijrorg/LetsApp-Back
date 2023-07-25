/*
  Warnings:

  - You are about to drop the `_InviteToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_InviteToUser" DROP CONSTRAINT "_InviteToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_InviteToUser" DROP CONSTRAINT "_InviteToUser_B_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "inviteId" TEXT;

-- DropTable
DROP TABLE "_InviteToUser";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
