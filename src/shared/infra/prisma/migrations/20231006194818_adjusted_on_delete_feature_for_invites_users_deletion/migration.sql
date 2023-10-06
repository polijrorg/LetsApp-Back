-- DropForeignKey
ALTER TABLE "InviteUser" DROP CONSTRAINT "InviteUser_inviteId_fkey";

-- DropForeignKey
ALTER TABLE "InviteUser" DROP CONSTRAINT "InviteUser_userEmail_fkey";

-- DropForeignKey
ALTER TABLE "PseudoInviteUser" DROP CONSTRAINT "PseudoInviteUser_inviteId_fkey";

-- DropForeignKey
ALTER TABLE "PseudoInviteUser" DROP CONSTRAINT "PseudoInviteUser_pseudoUserId_fkey";

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PseudoInviteUser" ADD CONSTRAINT "PseudoInviteUser_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PseudoInviteUser" ADD CONSTRAINT "PseudoInviteUser_pseudoUserId_fkey" FOREIGN KEY ("pseudoUserId") REFERENCES "pseudo_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
