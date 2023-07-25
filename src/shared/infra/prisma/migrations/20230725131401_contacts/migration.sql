-- CreateTable
CREATE TABLE "contato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "contato_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contato" ADD CONSTRAINT "contato_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
