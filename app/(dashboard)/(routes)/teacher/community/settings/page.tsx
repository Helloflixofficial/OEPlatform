import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { ensureCommunitySettings } from "@/lib/community";
import { isTeacher } from "@/lib/teacher";
import { CommunitySettingsForm } from "../_components/community-settings-form";

export const dynamic = "force-dynamic";

export default async function CommunitySettingsPage() {
  const { userId } = auth();
  if (!userId || !isTeacher(userId)) redirect("/");

  const settings = await ensureCommunitySettings(userId);
  return <CommunitySettingsForm initialSettings={{
    communityName: settings.communityName,
    tagline: settings.tagline,
    welcomeMessage: settings.welcomeMessage || "",
    allowStudentPosts: settings.allowStudentPosts,
    allowStudentComments: settings.allowStudentComments,
    requirePostApproval: settings.requirePostApproval,
    showMemberCount: settings.showMemberCount,
  }} />;
}
