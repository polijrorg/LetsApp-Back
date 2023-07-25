-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_inviteId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "inviteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
