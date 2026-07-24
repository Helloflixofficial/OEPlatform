import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// GET all sessions (all authenticated users can view to join)
export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await db.meetingSession.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[SESSIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create a new session (teacher only)
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isTeacher(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate a unique, URL-safe room name
    const roomName = `room-${randomBytes(6).toString("hex")}`;

    const session = await db.meetingSession.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        roomName,
        hostId: userId,
        isActive: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[SESSIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
