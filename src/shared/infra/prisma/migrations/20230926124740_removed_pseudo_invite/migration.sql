/*
  Warnings:

  - You are about to drop the column `idInvite` on the `InviteUser` table. All the data in the column will be lost.
  - You are about to drop the column `pseudoInviteId` on the `PseudoInviteUser` table. All the data in the column will be lost.
  - You are about to drop the `pseudo_invites` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `inviteId` to the `InviteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviteId` to the `PseudoInviteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optional` to the `PseudoInviteUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InviteUser" DROP CONSTRAINT "InviteUser_idInvite_fkey";

-- DropForeignKey
ALTER TABLE "PseudoInviteUser" DROP CONSTRAINT "PseudoInviteUser_pseudoInviteId_fkey";

-- AlterTable
ALTER TABLE "InviteUser" DROP COLUMN "idInvite",
ADD COLUMN     "inviteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PseudoInviteUser" DROP COLUMN "pseudoInviteId",
ADD COLUMN     "inviteId" TEXT NOT NULL,
ADD COLUMN     "optional" BOOLEAN NOT NULL,
ALTER COLUMN "Status" SET DEFAULT E'pseudoUser';

-- DropTable
DROP TABLE "pseudo_invites";

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PseudoInviteUser" ADD CONSTRAINT "PseudoInviteUser_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
