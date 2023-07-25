/*
  Warnings:

  - You are about to drop the column `guests` on the `invite` table. All the data in the column will be lost.
  - Added the required column `inviteId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "guests";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "inviteId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
