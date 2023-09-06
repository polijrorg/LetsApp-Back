/*
  Warnings:

  - Added the required column `optional` to the `InviteUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InviteUser" ADD COLUMN     "optional" BOOLEAN NOT NULL;
