"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Video, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MeetRoom } from "@/components/meet/MeetRoom";

interface PageProps {
  params: { roomName: string };
}

export default function StudentMeetPage({ params }: PageProps) {
  const { roomName } = params;
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get token");
      }
      const data = await res.json();
      setToken(data.token);
    } catch (err: any) {
      setError(err.message || "Unable to join session");
    } finally {
      setLoading(false);
    }
  }, [roomName]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push(`/sign-in?redirect_url=/meet/${roomName}`);
      return;
    }
    fetchToken();
  }, [isLoaded, userId, fetchToken, roomName, router]);

  // ── No config ──
  if (!serverUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-amber-400" />
        <h2 className="text-xl font-semibold text-white">Service Unavailable</h2>
        <p className="text-zinc-400 text-sm">This meeting service is not configured. Try again later.</p>
      </div>
    );
  }

  // ── Auth loading ──
  if (!isLoaded || (!userId && loading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Checking your access…</p>
      </div>
    );
  }

  // ── Token loading ──
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-600/20 flex items-center justify-center">
          <Video className="h-8 w-8 text-sky-400" />
        </div>
        <Loader2 className="h-6 w-6 text-sky-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Joining session…</p>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secured with your account
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-white">Unable to Join</h2>
        <p className="text-zinc-400 text-sm max-w-md">{error}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Home
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={fetchToken}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <MeetRoom
        serverUrl={serverUrl}
        token={token}
        roomName={roomName}
        isHost={false}
        onLeave={() => router.push("/")}
      />
    </div>
  );
}
