import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureCommunitySpaces, getCommunityOwnerId, slugify } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";

export async function GET() {
  const { userId } = auth();
  const ownerId = userId && isTeacher(userId) ? userId : getCommunityOwnerId();
  if (!userId || !ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const spaces = await ensureCommunitySpaces(ownerId);
    return NextResponse.json(spaces);
  } catch (error) {
    console.error("[COMMUNITY_SPACES_GET]", error);
    return NextResponse.json({ error: "Unable to load community spaces" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const color = typeof body.color === "string" && /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : "#bd8956";
    const slug = slugify(name);

    if (!name || name.length > 60 || !slug) {
      return NextResponse.json({ error: "Enter a space name up to 60 characters" }, { status: 400 });
    }

    const space = await db.communitySpace.create({
      data: { name, slug, description: description?.slice(0, 180) || null, color, ownerId: userId },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json(space, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "A space with that name already exists" }, { status: 409 });
    console.error("[COMMUNITY_SPACES_POST]", error);
    return NextResponse.json({ error: "Unable to create community space" }, { status: 500 });
  }
}
