-- CreateTable
CREATE TABLE "pseudo_invites" (
    "id" TEXT NOT NULL,

    CONSTRAINT "pseudo_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PseudoInvitePseudoUser" (
    "id" TEXT NOT NULL,
    "pseudoUserId" TEXT NOT NULL,
    "pseudoInviteId" TEXT NOT NULL,

    CONSTRAINT "PseudoInvitePseudoUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PseudoInvitePseudoUser" ADD CONSTRAINT "PseudoInvitePseudoUser_pseudoUserId_fkey" FOREIGN KEY ("pseudoUserId") REFERENCES "pseudo_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PseudoInvitePseudoUser" ADD CONSTRAINT "PseudoInvitePseudoUser_pseudoInviteId_fkey" FOREIGN KEY ("pseudoInviteId") REFERENCES "pseudo_invites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
