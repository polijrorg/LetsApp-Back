/*
  Warnings:

  - You are about to drop the `_MyRelationTable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `invitephone` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_MyRelationTable" DROP CONSTRAINT "_MyRelationTable_A_fkey";

-- DropForeignKey
ALTER TABLE "_MyRelationTable" DROP CONSTRAINT "_MyRelationTable_B_fkey";

-- AlterTable
ALTER TABLE "invite" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "invitephone" TEXT NOT NULL;

-- DropTable
DROP TABLE "_MyRelationTable";

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
