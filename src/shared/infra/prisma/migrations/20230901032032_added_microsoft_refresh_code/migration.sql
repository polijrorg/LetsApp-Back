/*
  Warnings:

  - You are about to drop the column `googleRefeshCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftRefeshCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `tokenCache` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "googleRefeshCode",
DROP COLUMN "microsoftRefeshCode",
DROP COLUMN "refreshToken",
DROP COLUMN "tokenCache",
DROP COLUMN "tokens",
ADD COLUMN     "googleRefreshCode" TEXT,
ADD COLUMN     "microsoftRefreshCode" TEXT,
ADD COLUMN     "token" TEXT;
