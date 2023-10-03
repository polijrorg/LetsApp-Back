/*
  Warnings:

  - Made the column `googleId` on table `invite` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "invite" ALTER COLUMN "googleId" SET NOT NULL;
