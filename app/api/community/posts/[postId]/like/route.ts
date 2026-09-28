import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCommunityOwnerId, serializeCommunityPost } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";

type Context = { params: { postId: string } };

async function getPost(postId: string, userId: string) {
  const ownerId = isTeacher(userId) ? userId : getCommunityOwnerId();
  if (!ownerId) return null;
  const post = await db.communityPost.findFirst({
    where: { id: postId, ownerId, isApproved: true },
    include: {
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { userId: true } },
    },
  });
  return post ? { post, ownerId } : null;
}

export async function POST(_req: Request, { params }: Context) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await getPost(params.postId, userId);
    if (!result) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    await db.communityLike.upsert({
      where: { userId_postId: { userId, postId: result.post.id } },
      create: { userId, postId: result.post.id, ownerId: result.ownerId },
      update: {},
    });
    const updated = await getPost(params.postId, userId);
    return NextResponse.json({ likeCount: updated?.post._count.likes || 0, userLiked: true });
  } catch (error) {
    console.error("[COMMUNITY_LIKE_POST]", error);
    return NextResponse.json({ error: "Unable to like post" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await getPost(params.postId, userId);
    if (!result) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    await db.communityLike.deleteMany({ where: { userId, postId: result.post.id } });
    const updated = await getPost(params.postId, userId);
    return NextResponse.json({ likeCount: updated?.post._count.likes || 0, userLiked: false });
  } catch (error) {
    console.error("[COMMUNITY_LIKE_DELETE]", error);
    return NextResponse.json({ error: "Unable to remove like" }, { status: 500 });
  }
}
