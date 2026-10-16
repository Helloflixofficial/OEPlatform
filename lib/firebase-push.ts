import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

type EncodedServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

let messagingClient: ReturnType<typeof getMessaging> | null | undefined;

function getFirebaseMessaging() {
  if (messagingClient !== undefined) return messagingClient;

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (!encoded) {
    messagingClient = null;
    return messagingClient;
  }

  let serviceAccount: EncodedServiceAccount;
  try {
    serviceAccount = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not valid base64 JSON");
  }

  const projectId = serviceAccount.project_id?.trim();
  const clientEmail = serviceAccount.client_email?.trim();
  const privateKey = serviceAccount.private_key;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase service-account credentials are incomplete");
  }

  const name = `oeplatform-fcm-${projectId}`;
  const app = getApps().find((candidate) => candidate.name === name)
    ?? initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    }, name);
  messagingClient = getMessaging(app);
  return messagingClient;
}

export async function sendCommunityPostPush(post: { id: string; title: string }) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return false;

  const title = post.title.trim().slice(0, 100);
  await messaging.send({
    topic: "community_students",
    notification: {
      title: "New post from Termini",
      body: title
        ? `A teacher shared "${title}" in Community. Open Termini to read it.`
        : "A teacher shared a new post in Community. Open Termini to read it.",
    },
    data: {
      type: "community_post",
      postId: post.id,
      route: "/notifications",
    },
    android: {
      priority: "high",
      notification: { channelId: "community_posts" },
    },
  });
  return true;
}
