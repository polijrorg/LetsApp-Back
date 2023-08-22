/*
  Warnings:

  - You are about to drop the column `status` on the `invite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "status",
ADD COLUMN     "state" TEXT NOT NULL DEFAULT E'needsAction';
