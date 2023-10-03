/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `pseudo_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `pseudo_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pseudo_users_phone_key" ON "pseudo_users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "pseudo_users_email_key" ON "pseudo_users"("email");
