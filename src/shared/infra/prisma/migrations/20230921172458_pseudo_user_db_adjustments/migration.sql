-- AlterTable
ALTER TABLE "InviteUser" ADD COLUMN     "pseudoUserId" TEXT;

-- AddForeignKey
ALTER TABLE "InviteUser" ADD CONSTRAINT "InviteUser_pseudoUserId_fkey" FOREIGN KEY ("pseudoUserId") REFERENCES "pseudo_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
