-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ios', 'android');

-- CreateTable
CREATE TABLE "user_push_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "push_token" VARCHAR(500) NOT NULL,
    "platform" "Platform" NOT NULL,
    "device_id" TEXT,
    "device_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_push_tokens_user_id_is_active_idx" ON "user_push_tokens"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "user_push_tokens_platform_idx" ON "user_push_tokens"("platform");

-- CreateIndex
CREATE INDEX "user_push_tokens_created_at_idx" ON "user_push_tokens"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_push_tokens_user_id_push_token_key" ON "user_push_tokens"("user_id", "push_token");
