-- CreateEnum
CREATE TYPE "Type" AS ENUM ('GOOGLE', 'OUTLOOK');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "type" "Type";
