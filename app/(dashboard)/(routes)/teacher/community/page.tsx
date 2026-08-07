import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { ensureCommunitySpaces, serializeCommunityPost } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";
import { CommunityDashboard } from "./_components/community-dashboard";

export const dynamic = "force-dynamic";

export default async function TeacherCommunityPage() {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) redirect("/");

  const spaces = await ensureCommunitySpaces(userId);
  const posts = await db.communityPost.findMany({
    where: { ownerId: userId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      space: { select: { id: true, name: true, color: true } },
      comments: { orderBy: { createdAt: "asc" }, take: 50 },
    },
  });

  return (
    <CommunityDashboard
      currentUserId={userId}
      initialSpaces={spaces.map((space) => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
        description: space.description,
        color: space.color,
        postCount: space._count.posts,
      }))}
      initialPosts={posts.map(serializeCommunityPost)}
    />
  );
}
