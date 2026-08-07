-- CreateTable
CREATE TABLE "CommunitySettings" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "communityName" TEXT NOT NULL DEFAULT 'Community',
    "tagline" TEXT NOT NULL DEFAULT 'Learn together, grow together.',
    "welcomeMessage" TEXT,
    "allowStudentPosts" BOOLEAN NOT NULL DEFAULT true,
    "allowStudentComments" BOOLEAN NOT NULL DEFAULT true,
    "requirePostApproval" BOOLEAN NOT NULL DEFAULT false,
    "showMemberCount" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunitySettings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "CommunitySettings_ownerId_key" ON "CommunitySettings"("ownerId");
