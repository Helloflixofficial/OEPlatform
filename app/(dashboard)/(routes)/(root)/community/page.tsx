import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { ensureCommunitySettings, ensureCommunitySpaces, getCommunityOwnerId, serializeCommunityPost } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";
import { StudentCommunity } from "./_components/student-community";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  const ownerId = isTeacher(userId) ? userId : getCommunityOwnerId();
  if (!ownerId) redirect("/");

  const [spaces, settings, posts] = await Promise.all([
    ensureCommunitySpaces(ownerId),
    ensureCommunitySettings(ownerId),
    db.communityPost.findMany({
      where: { ownerId, isApproved: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        space: { select: { id: true, name: true, color: true } },
        comments: { orderBy: { createdAt: "asc" }, take: 50 },
      },
    }),
  ]);

  return (
    <StudentCommunity
      currentUserId={userId}
      initialSettings={{
        communityName: settings.communityName,
        tagline: settings.tagline,
        welcomeMessage: settings.welcomeMessage || "",
        allowStudentPosts: settings.allowStudentPosts,
        allowStudentComments: settings.allowStudentComments,
        requirePostApproval: settings.requirePostApproval,
        showMemberCount: settings.showMemberCount,
      }}
      initialSpaces={spaces.map((space) => ({
        id: space.id,
        name: space.name,
        color: space.color,
        postCount: space._count.posts,
      }))}
      initialPosts={posts.map(serializeCommunityPost)}
    />
  );
}
