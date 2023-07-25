/*
  Warnings:

  - You are about to drop the column `nome` on the `contato` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `contato` table. All the data in the column will be lost.
  - Added the required column `name` to the `contato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `contato` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contato" DROP COLUMN "nome",
DROP COLUMN "telefone",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
