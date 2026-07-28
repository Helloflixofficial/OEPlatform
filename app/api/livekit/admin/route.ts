import { auth } from "@clerk/nextjs";
import { isTeacher } from "@/lib/teacher";
import { RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

function getLivekitHttpUrl(): string {
  return (process.env.NEXT_PUBLIC_LIVEKIT_URL || "")
    .replace(/^wss:\/\//, "https://")
    .replace(/^ws:\/\//, "http://");
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isTeacher(userId)) return NextResponse.json({ error: "Forbidden — teachers only" }, { status: 403 });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret)
    return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 });

  let body: { action: string; roomName: string; participantIdentity: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, roomName, participantIdentity } = body;
  if (!action || !roomName || !participantIdentity)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const svc = new RoomServiceClient(getLivekitHttpUrl(), apiKey, apiSecret);

  try {
    switch (action) {
      case "kick":
        await svc.removeParticipant(roomName, participantIdentity);
        break;

      case "mute":
        // Revoke publishing rights — participant cannot publish audio/video
        await svc.updateParticipant(roomName, participantIdentity, undefined, {
          canPublish: false,
          canSubscribe: true,
          canPublishData: true,
          canUpdateMetadata: true,
        });
        break;

      case "unmute":
        // Restore publishing rights
        await svc.updateParticipant(roomName, participantIdentity, undefined, {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canUpdateMetadata: true,
        });
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, action, participantIdentity });
  } catch (err: any) {
    console.error("[LIVEKIT_ADMIN]", err);
    return NextResponse.json(
      { error: err?.message || "Action failed" },
      { status: 500 }
    );
  }
}
