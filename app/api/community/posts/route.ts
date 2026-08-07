import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureCommunitySettings, ensureCommunitySpaces, getCommunityOwnerId, serializeCommunityPost } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  const isAdmin = !!userId && isTeacher(userId);
  const ownerId = isAdmin ? userId : getCommunityOwnerId();
  if (!userId || !ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureCommunitySpaces(ownerId);
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    const posts = await db.communityPost.findMany({
      where: { ownerId, ...(spaceId ? { spaceId } : {}), ...(isAdmin ? {} : { isApproved: true }) },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        space: { select: { id: true, name: true, color: true } },
        comments: { orderBy: { createdAt: "asc" }, take: 50 },
      },
    });
    return NextResponse.json(posts.map(serializeCommunityPost));
  } catch (error) {
    console.error("[COMMUNITY_POSTS_GET]", error);
    return NextResponse.json({ error: "Unable to load community posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = auth();
  const isAdmin = !!userId && isTeacher(userId);
  const ownerId = isAdmin ? userId : getCommunityOwnerId();
  if (!userId || !ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const settings = await ensureCommunitySettings(ownerId);
    if (!isAdmin && !settings.allowStudentPosts) return NextResponse.json({ error: "Student posts are currently disabled" }, { status: 403 });
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const spaceId = typeof body.spaceId === "string" ? body.spaceId : "";
    const isAnnouncement = isAdmin && body.isAnnouncement === true;

    if (!title || title.length > 120) return NextResponse.json({ error: "Add a post title up to 120 characters" }, { status: 400 });
    if (!content || content.length > 10000) return NextResponse.json({ error: "Add post content up to 10,000 characters" }, { status: 400 });

    const space = await db.communitySpace.findFirst({ where: { id: spaceId, ownerId } });
    if (!space) return NextResponse.json({ error: "Choose a valid community space" }, { status: 400 });

    const post = await db.communityPost.create({
      data: { title, content, spaceId: space.id, ownerId, authorId: userId, isAnnouncement, isApproved: isAdmin || !settings.requirePostApproval },
      include: { space: { select: { id: true, name: true, color: true } }, comments: true },
    });
    return NextResponse.json(serializeCommunityPost(post), { status: 201 });
  } catch (error) {
    console.error("[COMMUNITY_POSTS_POST]", error);
    return NextResponse.json({ error: "Unable to create community post" }, { status: 500 });
  }
}
