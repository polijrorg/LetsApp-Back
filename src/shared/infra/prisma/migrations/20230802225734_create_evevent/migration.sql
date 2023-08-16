/*
  Warnings:

  - You are about to drop the column `beginHour` on the `invite` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `invite` table. All the data in the column will be lost.
  - You are about to drop the column `endHour` on the `invite` table. All the data in the column will be lost.
  - You are about to drop the column `guests` on the `invite` table. All the data in the column will be lost.
  - Added the required column `begin` to the `invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleId` to the `invite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_guests_fkey";

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "beginHour",
DROP COLUMN "date",
DROP COLUMN "endHour",
DROP COLUMN "guests",
ADD COLUMN     "begin" TEXT NOT NULL,
ADD COLUMN     "end" TEXT NOT NULL,
ADD COLUMN     "googleId" TEXT NOT NULL,
ALTER COLUMN "link" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InviteUser" (
    "id" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "idInvite" TEXT NOT NULL,

    CONSTRAINT "InviteUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_idInvite_fkey" FOREIGN KEY ("idInvite") REFERENCES "invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_userPhone_fkey" FOREIGN KEY ("userPhone") REFERENCES "user"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;
