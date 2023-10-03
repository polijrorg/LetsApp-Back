/*
  Warnings:

  - You are about to drop the column `microsoftExpiresIn` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftRefreshCode` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "microsoftExpiresIn",
DROP COLUMN "microsoftRefreshCode";
