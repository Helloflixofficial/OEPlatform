-- Add indexes used by dashboard, teacher, learning, and community route queries.
CREATE INDEX "MeetingSession_hostId_createdAt_idx" ON "MeetingSession"("hostId", "createdAt");
CREATE INDEX "CommunitySpace_ownerId_createdAt_idx" ON "CommunitySpace"("ownerId", "createdAt");
CREATE INDEX "CommunityPost_ownerId_isApproved_createdAt_idx" ON "CommunityPost"("ownerId", "isApproved", "createdAt");
CREATE INDEX "Course_userId_idx" ON "title"("userId");
CREATE INDEX "Chapter_courseId_isPublished_position_idx" ON "Chapter"("courseId", "isPublished", "position");
CREATE INDEX "UserProgress_userId_chapterId_isCompleted_idx" ON "UserProgress"("userId", "chapterId", "isCompleted");
CREATE INDEX "Purchase_userId_createdAt_idx" ON "Purchase"("userId", "createdAt");
