/*
  Warnings:

  - You are about to drop the `_PseudoInviteToPseudoUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PseudoInviteToPseudoUser" DROP CONSTRAINT "_PseudoInviteToPseudoUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_PseudoInviteToPseudoUser" DROP CONSTRAINT "_PseudoInviteToPseudoUser_B_fkey";

-- DropTable
DROP TABLE "_PseudoInviteToPseudoUser";

-- CreateTable
CREATE TABLE "PseudoInviteUser" (
    "id" TEXT NOT NULL,
    "pseudoUserId" TEXT NOT NULL,
    "pseudoInviteId" TEXT NOT NULL,
    "Status" TEXT NOT NULL DEFAULT E'needsAction',

    CONSTRAINT "PseudoInviteUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PseudoInviteUser" ADD CONSTRAINT "PseudoInviteUser_pseudoUserId_fkey" FOREIGN KEY ("pseudoUserId") REFERENCES "pseudo_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PseudoInviteUser" ADD CONSTRAINT "PseudoInviteUser_pseudoInviteId_fkey" FOREIGN KEY ("pseudoInviteId") REFERENCES "pseudo_invites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
