/*
  Warnings:

  - You are about to drop the column `guests` on the `invite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "guests";

-- CreateTable
CREATE TABLE "_MyRelationTable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MyRelationTable_AB_unique" ON "_MyRelationTable"("A", "B");

-- CreateIndex
CREATE INDEX "_MyRelationTable_B_index" ON "_MyRelationTable"("B");

-- AddForeignKey
ALTER TABLE "_MyRelationTable" ADD CONSTRAINT "_MyRelationTable_A_fkey" FOREIGN KEY ("A") REFERENCES "invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MyRelationTable" ADD CONSTRAINT "_MyRelationTable_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
