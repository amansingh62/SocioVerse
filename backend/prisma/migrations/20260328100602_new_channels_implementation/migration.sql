/*
  Warnings:

  - You are about to drop the column `description` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChannelMessage` table. All the data in the column will be lost.
  - You are about to drop the `ChannelMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiresAt` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChannelMember" DROP CONSTRAINT "ChannelMember_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelMember" DROP CONSTRAINT "ChannelMember_userId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "description",
DROP COLUMN "isPublic",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ChannelMessage" DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "ChannelMember";

-- CreateTable
CREATE TABLE "ChannelBlocked" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelBlocked_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelBlocked_channelId_userId_key" ON "ChannelBlocked"("channelId", "userId");

-- CreateIndex
CREATE INDEX "Channel_creatorId_idx" ON "Channel"("creatorId");

-- CreateIndex
CREATE INDEX "Channel_expiresAt_idx" ON "Channel"("expiresAt");

-- CreateIndex
CREATE INDEX "Channel_creatorId_createdAt_idx" ON "Channel"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "ChannelMessage_createdAt_idx" ON "ChannelMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChannelMessage_channelId_createdAt_idx" ON "ChannelMessage"("channelId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChannelBlocked" ADD CONSTRAINT "ChannelBlocked_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelBlocked" ADD CONSTRAINT "ChannelBlocked_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
