-- AlterTable
ALTER TABLE "InviteUser" ALTER COLUMN "Status" SET DEFAULT E'needsAction',
ALTER COLUMN "Status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "invite" ALTER COLUMN "status" SET DATA TYPE TEXT;
