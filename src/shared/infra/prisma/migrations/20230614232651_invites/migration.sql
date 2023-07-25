-- CreateTable
CREATE TABLE "invite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "beginHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,
    "guests" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "invite_pkey" PRIMARY KEY ("id")
);
