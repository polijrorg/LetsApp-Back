/*
  Warnings:

  - You are about to drop the column `status` on the `invite` table. All the data in the column will be lost.
  - Added the required column `state` to the `invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "status",
ADD COLUMN     "state" TEXT NOT NULL;
