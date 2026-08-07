import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { slugify } from "@/lib/community";

type Context = { params: { spaceId: string } };

export async function PATCH(req: Request, { params }: Context) {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.communitySpace.findFirst({ where: { id: params.spaceId, ownerId: userId } });
    if (!existing) return NextResponse.json({ error: "Space not found" }, { status: 404 });

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const description = typeof body.description === "string" ? body.description.trim() : existing.description;
    const color = typeof body.color === "string" && /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : existing.color;
    const slug = slugify(name);
    if (!name || !slug) return NextResponse.json({ error: "A valid name is required" }, { status: 400 });

    const space = await db.communitySpace.update({
      where: { id: existing.id },
      data: { name, slug, description: description?.slice(0, 180) || null, color },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json(space);
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "A space with that name already exists" }, { status: 409 });
    console.error("[COMMUNITY_SPACES_PATCH]", error);
    return NextResponse.json({ error: "Unable to update community space" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const space = await db.communitySpace.findFirst({ where: { id: params.spaceId, ownerId: userId }, include: { _count: { select: { posts: true } } } });
    if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });
    if (space._count.posts > 0) return NextResponse.json({ error: "Move or delete the posts in this space first" }, { status: 409 });
    await db.communitySpace.delete({ where: { id: space.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMMUNITY_SPACES_DELETE]", error);
    return NextResponse.json({ error: "Unable to delete community space" }, { status: 500 });
  }
}
