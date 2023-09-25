/*
  Warnings:

  - You are about to drop the `PseudoInvitePseudoUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PseudoInvitePseudoUser" DROP CONSTRAINT "PseudoInvitePseudoUser_pseudoInviteId_fkey";

-- DropForeignKey
ALTER TABLE "PseudoInvitePseudoUser" DROP CONSTRAINT "PseudoInvitePseudoUser_pseudoUserId_fkey";

-- DropTable
DROP TABLE "PseudoInvitePseudoUser";

-- CreateTable
CREATE TABLE "_PseudoInviteToPseudoUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PseudoInviteToPseudoUser_AB_unique" ON "_PseudoInviteToPseudoUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PseudoInviteToPseudoUser_B_index" ON "_PseudoInviteToPseudoUser"("B");

-- AddForeignKey
ALTER TABLE "_PseudoInviteToPseudoUser" ADD CONSTRAINT "_PseudoInviteToPseudoUser_A_fkey" FOREIGN KEY ("A") REFERENCES "pseudo_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PseudoInviteToPseudoUser" ADD CONSTRAINT "_PseudoInviteToPseudoUser_B_fkey" FOREIGN KEY ("B") REFERENCES "pseudo_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
