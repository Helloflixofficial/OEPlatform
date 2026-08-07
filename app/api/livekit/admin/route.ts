import { auth } from "@clerk/nextjs";
import { isTeacher } from "@/lib/teacher";
import { RoomServiceClient, TrackSource } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

function getLivekitHttpUrl(): string {
  return (process.env.NEXT_PUBLIC_LIVEKIT_URL || "")
    .replace(/^wss:\/\//, "https://")
    .replace(/^ws:\/\//, "http://");
}

const ALL_PUBLISH_SOURCES = [
  TrackSource.CAMERA,
  TrackSource.MICROPHONE,
  TrackSource.SCREEN_SHARE,
  TrackSource.SCREEN_SHARE_AUDIO,
];
const NON_MIC_PUBLISH_SOURCES = ALL_PUBLISH_SOURCES.filter(
  (source) => source !== TrackSource.MICROPHONE,
);

type ModerationState = {
  requireRaiseHand: boolean;
  approvedSpeakers: string[];
};

function parseModerationState(metadata?: string | null): ModerationState {
  try {
    const parsed = JSON.parse(metadata || "{}");
    return {
      requireRaiseHand: parsed.requireRaiseHand === true,
      approvedSpeakers: Array.isArray(parsed.approvedSpeakers)
        ? parsed.approvedSpeakers.filter((id: unknown): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { requireRaiseHand: false, approvedSpeakers: [] };
  }
}

async function getModerationState(svc: RoomServiceClient, roomName: string) {
  const room = (await svc.listRooms([roomName]))[0];
  return parseModerationState(room?.metadata);
}

async function setParticipantPublishing(
  svc: RoomServiceClient,
  roomName: string,
  identity: string,
  mode: "all" | "microphone" | "enabled",
) {
  await svc.updateParticipant(roomName, identity, {
    permission: {
      canPublish: mode !== "all",
      canSubscribe: true,
      canPublishData: true,
      canUpdateMetadata: true,
      canPublishSources: mode === "all"
        ? []
        : mode === "microphone" ? NON_MIC_PUBLISH_SOURCES : ALL_PUBLISH_SOURCES,
    },
  });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isTeacher(userId)) return NextResponse.json({ error: "Forbidden — teachers only" }, { status: 403 });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret)
    return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 });

  let body: {
    action: string;
    roomName: string;
    participantIdentity?: string;
    requesterIdentity?: string;
    enabled?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, roomName, participantIdentity } = body;
  // The authenticated Clerk identity is authoritative; never trust the
  // participant identity supplied by the browser for excluding the admin.
  const requesterIdentity = userId;
  if (!action || !roomName)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const svc = new RoomServiceClient(getLivekitHttpUrl(), apiKey, apiSecret);

  try {
    switch (action) {
      case "kick":
        if (!participantIdentity) return NextResponse.json({ error: "Missing participant" }, { status: 400 });
        await svc.removeParticipant(roomName, participantIdentity);
        break;

      case "mute":
        if (!participantIdentity) return NextResponse.json({ error: "Missing participant" }, { status: 400 });
        await setParticipantPublishing(svc, roomName, participantIdentity, "all");
        break;

      case "unmute":
        if (!participantIdentity) return NextResponse.json({ error: "Missing participant" }, { status: 400 });
        await setParticipantPublishing(svc, roomName, participantIdentity, "enabled");
        break;

      case "mute-all":
        for (const participant of await svc.listParticipants(roomName)) {
          if (participant.identity !== requesterIdentity) {
            await setParticipantPublishing(svc, roomName, participant.identity, "all");
          }
        }
        break;

      case "unmute-all":
        for (const participant of await svc.listParticipants(roomName)) {
          if (participant.identity !== requesterIdentity) {
            await setParticipantPublishing(svc, roomName, participant.identity, "enabled");
          }
        }
        break;

      case "set-speaking-mode": {
        const enabled = body.enabled === true;
        for (const participant of await svc.listParticipants(roomName)) {
          if (participant.identity !== requesterIdentity) {
            await setParticipantPublishing(svc, roomName, participant.identity, enabled ? "microphone" : "enabled");
          }
        }
        const moderation = {
          requireRaiseHand: enabled,
          approvedSpeakers: [],
        } satisfies ModerationState;
        await svc.updateRoomMetadata(roomName, JSON.stringify(moderation));
        return NextResponse.json({ success: true, action, moderation });
      }

      case "approve-speaker": {
        if (!participantIdentity) return NextResponse.json({ error: "Missing participant" }, { status: 400 });
        await setParticipantPublishing(svc, roomName, participantIdentity, "enabled");
        const moderation = await getModerationState(svc, roomName);
        if (moderation.requireRaiseHand && !moderation.approvedSpeakers.includes(participantIdentity)) {
          moderation.approvedSpeakers.push(participantIdentity);
          await svc.updateRoomMetadata(roomName, JSON.stringify(moderation));
        }
        return NextResponse.json({ success: true, action, participantIdentity, moderation });
      }

      case "revoke-speaker": {
        if (!participantIdentity) return NextResponse.json({ error: "Missing participant" }, { status: 400 });
        await setParticipantPublishing(svc, roomName, participantIdentity, "microphone");
        const moderation = await getModerationState(svc, roomName);
        moderation.approvedSpeakers = moderation.approvedSpeakers.filter((id) => id !== participantIdentity);
        await svc.updateRoomMetadata(roomName, JSON.stringify(moderation));
        return NextResponse.json({ success: true, action, participantIdentity, moderation });
      }

      case "clear-moderation":
        await svc.updateRoomMetadata(roomName, JSON.stringify({ requireRaiseHand: false, approvedSpeakers: [] } satisfies ModerationState));
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
