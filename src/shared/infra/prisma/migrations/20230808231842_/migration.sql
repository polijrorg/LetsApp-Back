/*
  Warnings:

  - You are about to drop the column `userPhone` on the `InviteUser` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `InviteUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InviteUser" DROP CONSTRAINT "InviteUser_userPhone_fkey";

-- AlterTable
ALTER TABLE "InviteUser" DROP COLUMN "userPhone",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
