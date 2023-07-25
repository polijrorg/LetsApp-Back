/*
  Warnings:

  - You are about to drop the column `inviteId` on the `user` table. All the data in the column will be lost.
  - Added the required column `guests` to the `invite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_inviteId_fkey";

-- AlterTable
ALTER TABLE "invite" ADD COLUMN     "guests" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "inviteId";
