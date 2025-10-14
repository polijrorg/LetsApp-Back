/*
  Warnings:

  - You are about to drop the `user_push_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "invite_googleId_key";

-- DropTable
DROP TABLE "user_push_tokens";

-- DropEnum
DROP TYPE "Platform";
