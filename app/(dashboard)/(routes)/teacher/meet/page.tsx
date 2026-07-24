"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Video,
  Plus,
  Copy,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { isTeacher } from "@/lib/teacher";

interface MeetingSession {
  id: string;
  title: string;
  description: string | null;
  roomName: string;
  hostId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CreateSessionModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (session: MeetingSession) => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Session title is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/livekit/sessions", { title, description });
      onCreated(res.data);
      toast.success("Session created!");
      onClose();
    } catch {
      toast.error("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <Video className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">New Meeting Session</h2>
            <p className="text-xs text-slate-500">Create a live class or meeting room</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Session Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Intro to React – Live Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-slate-200 focus:border-sky-400 focus:ring-sky-400"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreate()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="What will this session cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-slate-200 focus:border-sky-400 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 border-slate-200"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</>
            ) : (
              <><Video className="h-4 w-4 mr-2" /> Create Session</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SessionCard = ({
  session,
  onDelete,
  onJoin,
}: {
  session: MeetingSession;
  onDelete: (id: string) => void;
  onJoin: (roomName: string) => void;
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const joinUrl = `${appUrl}/meet/${session.roomName}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Join link copied!");
  };

  const timeAgo = formatDistanceToNow(new Date(session.createdAt), { addSuffix: true });

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        session.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
      }`}
    >
      {/* Status bar */}
      <div
        className={`h-1 w-full ${session.isActive ? "bg-gradient-to-r from-sky-400 to-indigo-400" : "bg-slate-200"}`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  session.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {session.isActive ? (
                  <><CheckCircle2 className="h-3 w-3" /> Active</>
                ) : (
                  <><XCircle className="h-3 w-3" /> Ended</>
                )}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
              {session.title}
            </h3>
            {session.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{session.description}</p>
            )}
          </div>
        </div>

        {/* Room info */}
        <div className="flex items-center gap-1.5 mb-4">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Created {timeAgo}</span>
          <span className="text-slate-200 mx-1">·</span>
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">
            {session.roomName}
          </span>
        </div>

        {/* Join URL display */}
        {session.isActive && (
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-2 mb-4 border border-slate-100">
            <span className="text-xs text-slate-500 font-mono flex-1 truncate">{joinUrl}</span>
            <button
              onClick={copyLink}
              className="text-sky-500 hover:text-sky-700 transition-colors flex-shrink-0"
              title="Copy join link"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {session.isActive && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs h-8"
                onClick={() => onJoin(session.roomName)}
              >
                <Video className="h-3.5 w-3.5 mr-1.5" />
                Start / Join
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50"
                onClick={copyLink}
                title="Copy join link"
              >
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-slate-200 hover:bg-red-50 hover:border-red-200 group"
                onClick={() => onDelete(session.id)}
                title="End session"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-500" />
              </Button>
            </>
          )}
          {!session.isActive && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" /> This session has ended
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TeacherMeetPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get("/api/livekit/sessions");
      setSessions(res.data);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = async (id: string) => {
    if (!confirm("End this session? Students will no longer be able to join.")) return;
    try {
      await axios.delete(`/api/livekit/sessions/${id}`);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: false } : s))
      );
      toast.success("Session ended");
    } catch {
      toast.error("Failed to end session");
    }
  };

  const handleJoin = (roomName: string) => {
    router.push(`/teacher/meet/${roomName}`);
  };

  const handleCreated = (session: MeetingSession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const activeSessions = sessions.filter((s) => s.isActive);
  const endedSessions = sessions.filter((s) => !s.isActive);

  const isCurrentTeacher = isTeacher(userId);

  return (
    <div className="min-h-screen bg-slate-50">
      {showModal && (
        <CreateSessionModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-sm">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">ShortMeet</h1>
              <p className="text-sm text-slate-500">Live classes & video sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              className="border-slate-200 text-slate-600 h-9"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
            {isCurrentTeacher && (
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white h-9 shadow-sm"
                onClick={() => setShowModal(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Session
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{activeSessions.length}</p>
                <p className="text-xs text-slate-500">Active Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{endedSessions.length}</p>
                <p className="text-xs text-slate-500">Ended Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{sessions.length}</p>
                <p className="text-xs text-slate-500">Total Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading sessions…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center">
              <Video className="h-10 w-10 text-sky-300" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-700">No sessions yet</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Create your first live session. Students can join using a link — only authenticated
                users are allowed in.
              </p>
            </div>
            {isCurrentTeacher && (
              <Button
                className="bg-sky-600 hover:bg-sky-700 text-white mt-2"
                onClick={() => setShowModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Session
              </Button>
            )}
          </div>
        )}

        {/* Active Sessions */}
        {!loading && activeSessions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Active Sessions ({activeSessions.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={handleDelete}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ended Sessions */}
        {!loading && endedSessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                Ended Sessions ({endedSessions.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={handleDelete}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Info Banner */}
        {!loading && (
          <div className="mt-10 bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ExternalLink className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-800">How ShortMeet works</p>
              <ul className="mt-1.5 space-y-1 text-xs text-sky-700">
                <li>• Create a session and copy the join link</li>
                <li>• Share the link with your students via messages or the course page</li>
                <li>• Only users with an account on this platform can join — no outsiders</li>
                <li>• You can end any session at any time from this dashboard</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
