CREATE TABLE "CommunityLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityLike_userId_postId_key" ON "CommunityLike"("userId", "postId");
CREATE INDEX "CommunityLike_postId_createdAt_idx" ON "CommunityLike"("postId", "createdAt");
CREATE INDEX "CommunityLike_ownerId_createdAt_idx" ON "CommunityLike"("ownerId", "createdAt");
ALTER TABLE "CommunityLike" ADD CONSTRAINT "CommunityLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
