/*
  Warnings:

  - You are about to drop the column `creatorPhoto` on the `invite` table. All the data in the column will be lost.
  - Added the required column `organizerName` to the `invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "creatorPhoto",
ADD COLUMN     "organizerName" TEXT NOT NULL,
ADD COLUMN     "organizerPhoto" TEXT;
