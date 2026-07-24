"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Video, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MeetRoom } from "@/components/meet/MeetRoom";

interface PageProps {
  params: { roomName: string };
}

export default function TeacherVideoRoomPage({ params }: PageProps) {
  const { roomName } = params;
  const { userId } = useAuth();
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
      setError(err.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  }, [roomName]);

  useEffect(() => {
    if (userId) fetchToken();
  }, [userId, fetchToken]);

  // ── No LiveKit config ──
  if (!serverUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-amber-400" />
        <h2 className="text-xl font-semibold text-white">LiveKit Not Configured</h2>
        <p className="text-zinc-400 text-sm max-w-sm">
          Add <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">NEXT_PUBLIC_LIVEKIT_URL</code> to your{" "}
          <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">.env</code> file.
        </p>
        <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => router.push("/teacher/meet")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-600/20 flex items-center justify-center">
          <Video className="h-8 w-8 text-sky-400" />
        </div>
        <Loader2 className="h-6 w-6 text-sky-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Connecting as host…</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-white">Connection Error</h2>
        <p className="text-zinc-400 text-sm max-w-md">{error}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => router.push("/teacher/meet")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
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
        isHost={true}
        onLeave={() => router.push("/teacher/meet")}
      />
    </div>
  );
}
