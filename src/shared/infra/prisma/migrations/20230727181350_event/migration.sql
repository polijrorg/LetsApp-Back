/*
  Warnings:

  - You are about to drop the column `Status` on the `invite` table. All the data in the column will be lost.
  - Added the required column `status` to the `invite` table without a default value. This is not possible if the table is not empty.
  - Made the column `guests` on table `invite` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_guests_fkey";

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "Status",
ADD COLUMN     "status" INTEGER NOT NULL,
ALTER COLUMN "guests" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_guests_fkey" FOREIGN KEY ("guests") REFERENCES "user"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;
