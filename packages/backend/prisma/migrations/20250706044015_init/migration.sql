-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pkm";

-- CreateEnum
CREATE TYPE "auth"."UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "auth"."UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "pkm"."NoteContentType" AS ENUM ('MARKDOWN', 'RICH_TEXT', 'CODE', 'DIAGRAM', 'DRAWING');

-- CreateEnum
CREATE TYPE "pkm"."NoteLinkType" AS ENUM ('RELATED', 'REFERENCES', 'CHILD_OF', 'PARENT_OF', 'BLOCKS', 'SUPPORTS', 'CONTRASTS', 'UPDATES', 'MENTIONS');

-- CreateEnum
CREATE TYPE "pkm"."NotificationType" AS ENUM ('SYSTEM_ALERT', 'NOTE_UPDATED', 'NOTE_SHARED', 'MENTION', 'COMMENT', 'TASK_ASSIGNED', 'PASSWORD_CHANGED', 'LOGIN_ALERT');

-- CreateEnum
CREATE TYPE "pkm"."ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'NOTE_CREATED', 'NOTE_UPDATED', 'NOTE_DELETED', 'TAG_CREATED', 'TAG_UPDATED', 'PASSWORD_CHANGED', 'PROFILE_UPDATED', 'SETTINGS_UPDATED');

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "lastLogin" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "role" "auth"."UserRole" NOT NULL DEFAULT 'USER',
    "status" "auth"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."oauth_accounts" (
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("provider","providerUserId")
);

-- CreateTable
CREATE TABLE "pkm"."notes" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkm"."tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "color" VARCHAR(7) DEFAULT '#3b82f6',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkm"."note_tags" (
    "noteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "note_tags_pkey" PRIMARY KEY ("noteId","tagId")
);

-- CreateTable
CREATE TABLE "pkm"."note_links" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'RELATED',
    "description" VARCHAR(500),
    "weight" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "note_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkm"."search_history" (
    "id" TEXT NOT NULL,
    "query" VARCHAR(500) NOT NULL,
    "filters" JSONB DEFAULT '{}',
    "resultCount" INTEGER,
    "userId" TEXT NOT NULL,
    "lastSearched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "searchCount" INTEGER NOT NULL DEFAULT 1,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(200),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkm"."user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "theme" VARCHAR(50) DEFAULT 'light',
    "language" VARCHAR(10) DEFAULT 'en',
    "timezone" VARCHAR(50) DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."audit_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "userId" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "auth"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "notes_slug_key" ON "pkm"."notes"("slug");

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "pkm"."notes"("userId");

-- CreateIndex
CREATE INDEX "notes_slug_idx" ON "pkm"."notes"("slug");

-- CreateIndex
CREATE INDEX "notes_isPinned_idx" ON "pkm"."notes"("isPinned");

-- CreateIndex
CREATE INDEX "notes_isArchived_idx" ON "pkm"."notes"("isArchived");

-- CreateIndex
CREATE INDEX "notes_createdAt_idx" ON "pkm"."notes"("createdAt");

-- CreateIndex
CREATE INDEX "notes_updatedAt_idx" ON "pkm"."notes"("updatedAt");

-- CreateIndex
CREATE INDEX "tags_userId_idx" ON "pkm"."tags"("userId");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "pkm"."tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_userId_key" ON "pkm"."tags"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_userId_key" ON "pkm"."tags"("slug", "userId");

-- CreateIndex
CREATE INDEX "note_tags_tagId_idx" ON "pkm"."note_tags"("tagId");

-- CreateIndex
CREATE INDEX "note_links_sourceId_idx" ON "pkm"."note_links"("sourceId");

-- CreateIndex
CREATE INDEX "note_links_targetId_idx" ON "pkm"."note_links"("targetId");

-- CreateIndex
CREATE INDEX "note_links_type_idx" ON "pkm"."note_links"("type");

-- CreateIndex
CREATE INDEX "note_links_createdAt_idx" ON "pkm"."note_links"("createdAt");

-- CreateIndex
CREATE INDEX "search_history_userId_idx" ON "pkm"."search_history"("userId");

-- CreateIndex
CREATE INDEX "search_history_lastSearched_idx" ON "pkm"."search_history"("lastSearched");

-- CreateIndex
CREATE INDEX "search_history_isSaved_idx" ON "pkm"."search_history"("isSaved");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "pkm"."user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "auth"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "auth"."password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "auth"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "auth"."password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "auth"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "auth"."audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "auth"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "auth"."audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."note_tags" ADD CONSTRAINT "note_tags_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "pkm"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."note_tags" ADD CONSTRAINT "note_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "pkm"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."note_links" ADD CONSTRAINT "note_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "pkm"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."note_links" ADD CONSTRAINT "note_links_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "pkm"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."note_links" ADD CONSTRAINT "note_links_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."search_history" ADD CONSTRAINT "search_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkm"."user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
