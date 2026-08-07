import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureCommunitySettings, getCommunityOwnerId } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";

type Context = { params: { postId: string } };

export async function POST(req: Request, { params }: Context) {
  const { userId } = auth();
  const isAdmin = !!userId && isTeacher(userId);
  const ownerId = isAdmin ? userId : getCommunityOwnerId();
  if (!userId || !ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await ensureCommunitySettings(ownerId);
    if (!isAdmin && !settings.allowStudentComments) return NextResponse.json({ error: "Student comments are currently disabled" }, { status: 403 });
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length > 2000) return NextResponse.json({ error: "Comment must be between 1 and 2,000 characters" }, { status: 400 });

    const post = await db.communityPost.findFirst({ where: { id: params.postId, ownerId, ...(isAdmin ? {} : { isApproved: true }) } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comment = await db.communityComment.create({ data: { content, postId: post.id, ownerId, authorId: userId } });
    return NextResponse.json({ ...comment, createdAt: comment.createdAt.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("[COMMUNITY_COMMENT_POST]", error);
    return NextResponse.json({ error: "Unable to add comment" }, { status: 500 });
  }
}
