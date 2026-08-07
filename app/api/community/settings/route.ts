import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureCommunitySettings } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";

function settingsPayload(settings: Awaited<ReturnType<typeof ensureCommunitySettings>>) {
  return {
    communityName: settings.communityName,
    tagline: settings.tagline,
    welcomeMessage: settings.welcomeMessage,
    allowStudentPosts: settings.allowStudentPosts,
    allowStudentComments: settings.allowStudentComments,
    requirePostApproval: settings.requirePostApproval,
    showMemberCount: settings.showMemberCount,
  };
}

export async function GET() {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json(settingsPayload(await ensureCommunitySettings(userId)));
  } catch (error) {
    console.error("[COMMUNITY_SETTINGS_GET]", error);
    return NextResponse.json({ error: "Unable to load community settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const communityName = typeof body.communityName === "string" ? body.communityName.trim() : "";
    const tagline = typeof body.tagline === "string" ? body.tagline.trim() : "";
    const welcomeMessage = typeof body.welcomeMessage === "string" ? body.welcomeMessage.trim() : null;

    if (communityName.length < 2 || communityName.length > 80) {
      return NextResponse.json({ error: "Community name must be between 2 and 80 characters" }, { status: 400 });
    }
    if (tagline.length > 160) return NextResponse.json({ error: "Tagline must be 160 characters or fewer" }, { status: 400 });
    if (welcomeMessage && welcomeMessage.length > 600) return NextResponse.json({ error: "Welcome message must be 600 characters or fewer" }, { status: 400 });

    const booleanFields = ["allowStudentPosts", "allowStudentComments", "requirePostApproval", "showMemberCount"] as const;
    if (booleanFields.some((field) => typeof body[field] !== "boolean")) {
      return NextResponse.json({ error: "All community permission settings are required" }, { status: 400 });
    }

    const settings = await ensureCommunitySettings(userId);
    const updated = await db.communitySettings.update({
      where: { id: settings.id },
      data: {
        communityName,
        tagline,
        welcomeMessage: welcomeMessage || null,
        allowStudentPosts: body.allowStudentPosts,
        allowStudentComments: body.allowStudentComments,
        requirePostApproval: body.requirePostApproval,
        showMemberCount: body.showMemberCount,
      },
    });

    return NextResponse.json(settingsPayload(updated));
  } catch (error) {
    console.error("[COMMUNITY_SETTINGS_PATCH]", error);
    return NextResponse.json({ error: "Unable to save community settings" }, { status: 500 });
  }
}
