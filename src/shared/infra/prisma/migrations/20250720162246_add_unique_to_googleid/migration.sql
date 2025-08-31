/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `invite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invite_googleId_key" ON "invite"("googleId");
