import { auth, currentUser } from "@clerk/nextjs";
import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { isTeacher } from "@/lib/teacher";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = req.nextUrl.searchParams.get("room");
  if (!room) {
    return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit not configured. Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to .env" },
      { status: 500 }
    );
  }

  const user = await currentUser();
  const participantName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.emailAddresses?.[0]?.emailAddress ?? userId;

  const isHost = isTeacher(userId);

  // Pass Clerk profile picture + role as participant metadata
  // This lets the custom video UI show real avatars for everyone
  const metadata = JSON.stringify({
    imageUrl: user?.imageUrl ?? null,
    isTeacher: isHost,
  });

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: participantName,
    ttl: "4h",
    metadata,
  });

  at.addGrant({
    roomJoin: true,
    room,
    // Everyone can publish camera, mic, screen share and data (chat)
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
    // Teachers get full room admin rights
    ...(isHost && {
      roomAdmin: true,
      roomRecord: true,
    }),
  });

  const token = await at.toJwt();
  return NextResponse.json({ token, participantName, isHost });
}
