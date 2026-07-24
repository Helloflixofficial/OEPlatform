import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { NextRequest, NextResponse } from "next/server";

// DELETE — end/deactivate a session (teacher/host only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isTeacher(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const session = await db.meetingSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.hostId !== userId) {
      return NextResponse.json({ error: "Forbidden — not the host" }, { status: 403 });
    }

    await db.meetingSession.update({
      where: { id: params.sessionId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SESSION_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — reactivate a session
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isTeacher(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const session = await db.meetingSession.update({
      where: { id: params.sessionId },
      data: { isActive: true },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[SESSION_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
