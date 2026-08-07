import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeCommunityPost } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";

type Context = { params: { postId: string } };

export async function PATCH(req: Request, { params }: Context) {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.communityPost.findFirst({ where: { id: params.postId, ownerId: userId } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.isPinned === "boolean") data.isPinned = body.isPinned;
    if (typeof body.isAnnouncement === "boolean") data.isAnnouncement = body.isAnnouncement;
    if (typeof body.isApproved === "boolean") data.isApproved = body.isApproved;
    if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim().slice(0, 120);
    if (typeof body.content === "string" && body.content.trim()) data.content = body.content.trim().slice(0, 10000);
    if (typeof body.spaceId === "string") {
      const space = await db.communitySpace.findFirst({ where: { id: body.spaceId, ownerId: userId } });
      if (!space) return NextResponse.json({ error: "Space not found" }, { status: 400 });
      data.spaceId = space.id;
    }

    const post = await db.communityPost.update({
      where: { id: existing.id },
      data,
      include: { space: { select: { id: true, name: true, color: true } }, comments: { orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json(serializeCommunityPost(post));
  } catch (error) {
    console.error("[COMMUNITY_POST_PATCH]", error);
    return NextResponse.json({ error: "Unable to update community post" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const post = await db.communityPost.findFirst({ where: { id: params.postId, ownerId: userId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    await db.communityPost.delete({ where: { id: post.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMMUNITY_POST_DELETE]", error);
    return NextResponse.json({ error: "Unable to delete community post" }, { status: 500 });
  }
}
