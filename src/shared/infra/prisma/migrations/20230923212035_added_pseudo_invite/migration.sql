/*
  Warnings:

  - You are about to drop the column `pseudoUserId` on the `InviteUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InviteUser" DROP CONSTRAINT "InviteUser_pseudoUserId_fkey";

-- AlterTable
ALTER TABLE "InviteUser" DROP COLUMN "pseudoUserId";
