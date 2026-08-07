"use client";

import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from "react";
import {
  LiveKitRoom, useLocalParticipant, useParticipants,
  useTracks, VideoTrack, RoomAudioRenderer, useChat,
  useRoomContext, useSpeakingParticipants,
} from "@livekit/components-react";
import { Track, RoomEvent, RoomOptions, AudioPresets } from "livekit-client";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, Monitor, MonitorOff,
  MessageSquare, PhoneOff, Users, X, Crown, Send, UserX,
  Volume2, VolumeX, Shield, Hand, Smile, Link2, Pin, PinOff,
  Headphones, MoreHorizontal, Menu, Settings, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

// ═══════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════

interface PMeta { imageUrl?: string | null; isTeacher?: boolean; }
interface DataMsg {
  type: "hand" | "reaction" | "lower-hand";
  identity: string;
  raised?: boolean;
  emoji?: string;
  name?: string;
}
interface FloatEmoji { id: string; emoji: string; x: number; name: string; }

const EMOJI_LIST = ["👍", "❤️", "😂", "🎉", "😮", "👏", "🔥", "💯"] as const;

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

function safeMeta(m?: string | null): PMeta {
  try { return JSON.parse(m || "{}"); } catch { return {}; }
}
function safeName(p: any): string {
  return p?.name || p?.identity || "Participant";
}
function canPublishAudio(p: any): boolean {
  if (p?.permissions?.canPublish === false) return false;
  const sources = p?.permissions?.canPublishSources;
  if (Array.isArray(sources)) {
    return sources.includes(Track.Source.Microphone as any)
      || sources.includes("MICROPHONE")
      || sources.includes(2);
  }
  return p?.permissions?.canPublish !== false;
}
async function doAdmin(action: string, roomName: string, identity = "", extra: Record<string, unknown> = {}) {
  const r = await fetch("/api/livekit/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, roomName, participantIdentity: identity, ...extra }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(d.error || "Action failed");
  }
  return r.json();
}

function parseModerationState(metadata?: string | null): { requireRaiseHand: boolean; approvedSpeakers: string[] } {
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

// ═══════════════════════════════════════════════════════════════════
//  AVATAR
// ═══════════════════════════════════════════════════════════════════

function Avatar({ imageUrl, name, size = "md", speaking = false }: {
  imageUrl?: string | null; name: string;
  size?: "xs" | "sm" | "md" | "lg"; speaking?: boolean;
}) {
  const [err, setErr] = useState(false);
  const sz = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-20 h-20 text-2xl" }[size];
  const init = (name?.[0] ?? "?").toUpperCase();
  return (
    <div className={cn("relative rounded-full flex-shrink-0", speaking && "ring-2 ring-offset-1 ring-green-500 ring-offset-[#2b2d31]")}>
      {imageUrl && !err
        ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt={name} referrerPolicy="no-referrer" onError={() => setErr(true)} className={cn("rounded-full object-cover", sz)} />
        )
        : <div className={cn("rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-sky-500 to-indigo-600", sz)}>{init}</div>
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PARTICIPANT TILE
// ═══════════════════════════════════════════════════════════════════

function ParticipantTile({ participant, trackRef, isLocal, isHost, isHostTile, roomName, isPinned, handRaised, speaking, onPin, onUnpin, onAdmin }: {
  participant: any; trackRef: any; isLocal: boolean; isHost: boolean; isHostTile: boolean;
  roomName: string; isPinned: boolean; handRaised: boolean; speaking: boolean;
  onPin: () => void; onUnpin: () => void; onAdmin: (a: string, id: string) => void;
}) {
  const meta = safeMeta(participant?.metadata);
  const name = safeName(participant);
  const isMuted = !participant?.isMicrophoneEnabled;
  const canPub = canPublishAudio(participant);
  const hasVideo = (() => {
    try { return trackRef && "publication" in trackRef && trackRef.publication?.isEnabled && trackRef.publication?.track; }
    catch { return false; }
  })();

  return (
    <div className={cn(
      "group relative rounded-xl overflow-hidden aspect-video transition-all bg-[#1e1f22]",
      speaking ? "ring-2 ring-green-500" : "ring-1 ring-white/5"
    )}>
      {hasVideo
        ? <VideoTrack trackRef={trackRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2b2d31] gap-2">
            <Avatar imageUrl={meta.imageUrl} name={name} size="lg" speaking={speaking} />
            {isLocal && <p className="text-[#b5bac1] text-[11px]">Camera off</p>}
          </div>
        )
      }

      {/* Top badges */}
      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
        {handRaised && <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">✋</span>}
        {participant?.isScreenShareEnabled && <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">SHARING</span>}
      </div>

      {/* Pin button on hover */}
      <button
        onClick={isPinned ? onUnpin : onPin}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg"
        title={isPinned ? "Unpin" : "Pin / Spotlight"}
      >
        {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      </button>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 py-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isHostTile && <Crown className="h-3 w-3 text-amber-400 flex-shrink-0" />}
            {meta.isTeacher && !isLocal && <Shield className="h-3 w-3 text-sky-400 flex-shrink-0" />}
            {speaking && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
            <span className="text-white text-[11px] font-medium truncate">
              {name}{isLocal && <span className="text-[#b5bac1] text-[10px] ml-1">(You)</span>}
            </span>
          </div>
          {isMuted && canPub && (
            <div className="bg-red-500/80 rounded-full p-0.5 flex-shrink-0">
              <MicOff className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Teacher admin overlay on hover */}
      {isHost && !isLocal && (
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex flex-col gap-1.5">
            {canPub
              ? <button onClick={() => onAdmin("mute", participant.identity)} className="flex items-center gap-1.5 bg-[#2b2d31]/90 hover:bg-[#383a40] border border-[#3f4147] text-white text-xs px-3 py-1.5 rounded-lg w-28 justify-center"><VolumeX className="h-3.5 w-3.5" /> Mute</button>
              : <button onClick={() => onAdmin("unmute", participant.identity)} className="flex items-center gap-1.5 bg-sky-600/90 hover:bg-sky-500 text-white text-xs px-3 py-1.5 rounded-lg w-28 justify-center"><Volume2 className="h-3.5 w-3.5" /> Unmute</button>
            }
            <button onClick={() => onAdmin("kick", participant.identity)} className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg w-28 justify-center"><UserX className="h-3.5 w-3.5" /> Remove</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LEFT SIDEBAR — Discord Voice Channel Members
// ═══════════════════════════════════════════════════════════════════

function LeftSidebar({ all, localId, isHost, roomName, raisedHands, speakerIds, speakingMode, approvedSpeakers, onAdmin, onPin, onClose }: {
  all: any[]; localId: string; isHost: boolean; roomName: string;
  raisedHands: Set<string>; speakerIds: Set<string>;
  speakingMode: boolean; approvedSpeakers: Set<string>;
  onAdmin: (a: string, id: string) => void;
  onPin: (id: string) => void;
  onClose?: () => void;
}) {
  const [ctxMenu, setCtxMenu] = useState<{ identity: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const contextParticipant = ctxMenu ? all.find((participant) => participant?.identity === ctxMenu.identity) : null;
  const contextCanPublishAudio = canPublishAudio(contextParticipant);

  return (
    <div className="flex flex-col h-full w-[min(88vw,260px)] lg:w-[220px] border-r flex-shrink-0" style={{ background: "#2b2d31", borderColor: "#1e1f22" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: "#1e1f22" }}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-green-400 uppercase tracking-wide">Voice Connected</span>
          </div>
          <p className="text-[11px] text-[#b5bac1] mt-0.5 truncate font-mono">{roomName}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#b5bac1] hover:text-white p-1 rounded transition-colors flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Members header */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b5bac1]">In Voice — {all.length}</p>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-2 space-y-px">
        {all.map(p => {
          if (!p) return null;
          const meta = safeMeta(p?.metadata);
          const name = safeName(p);
          const isLocal = p?.identity === localId;
          const isMuted = !p?.isMicrophoneEnabled;
          const canPub = canPublishAudio(p);
          const speaking = speakerIds.has(p?.identity ?? "");
          const handUp = raisedHands.has(p?.identity ?? "");

          return (
            <div
              key={p?.identity ?? Math.random()}
              onContextMenu={isHost && !isLocal ? (e) => {
                e.preventDefault();
                setCtxMenu({ identity: p.identity, x: e.clientX, y: e.clientY });
              } : undefined}
              className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-default select-none transition-colors"
            >
              <Avatar imageUrl={meta.imageUrl} name={name} size="sm" speaking={speaking} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {meta.isTeacher && <Crown className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                  <span className={cn("text-[13px] font-medium truncate", speaking ? "text-green-300" : "text-[#dbdee1]")}>{name}</span>
                </div>
                {isLocal && <p className="text-[10px] text-[#b5bac1]">You</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {handUp && <span className="text-sm">✋</span>}
                {!canPub && <MicOff className="h-3 w-3 text-amber-400" />}
                {canPub && isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                {!p?.isCameraEnabled && <VideoOff className="h-3 w-3 text-[#4e5058]" />}
              </div>
              {isHost && !isLocal && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCtxMenu({ identity: p.identity, x: e.clientX, y: e.clientY }); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#b5bac1] hover:text-white transition-opacity"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Right-click context menu */}
      {ctxMenu && (
        <div
          className="fixed z-[100] rounded-xl shadow-2xl border py-1.5 min-w-[175px] overflow-hidden"
          style={{ top: Math.min(ctxMenu.y, window.innerHeight - 180), left: Math.min(ctxMenu.x, window.innerWidth - 190), background: "#18191c", borderColor: "#040405" }}
          onClick={e => e.stopPropagation()}
        >
          {[
            contextCanPublishAudio
              ? { label: "Mute", icon: VolumeX, action: "mute", cls: "text-[#dbdee1] hover:bg-[#5865f2] hover:text-white" }
              : { label: "Unmute", icon: Volume2, action: "unmute", cls: "text-sky-300 hover:bg-sky-600 hover:text-white" },
            ...(raisedHands.has(ctxMenu.identity)
              ? [{ label: "Allow to speak", icon: Check, action: "approve-speaker", cls: "text-emerald-300 hover:bg-emerald-600 hover:text-white" }]
              : []),
            ...(speakingMode && approvedSpeakers.has(ctxMenu.identity)
              ? [{ label: "Revoke speaking", icon: VolumeX, action: "revoke-speaker", cls: "text-amber-300 hover:bg-amber-600 hover:text-white" }]
              : []),
            { label: "Spotlight", icon: Pin, action: "__pin", cls: "text-[#dbdee1] hover:bg-[#5865f2] hover:text-white" },
            { label: "Lower Hand", icon: Hand, action: "lower-hand", cls: "text-[#dbdee1] hover:bg-amber-600 hover:text-white" },
            { label: "Remove from call", icon: UserX, action: "kick", cls: "text-red-400 hover:bg-red-600 hover:text-white" },
          ].map(({ label, icon: Icon, action, cls }) => (
            <button key={action}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors text-left", cls)}
              onClick={() => {
                if (action === "__pin") { onPin(ctxMenu.identity); }
                else { onAdmin(action, ctxMenu.identity); }
                setCtxMenu(null);
              }}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CHAT PANEL — Discord style with message grouping
// ═══════════════════════════════════════════════════════════════════

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { chatMessages, send, isSending } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const msgs = (chatMessages as any[]).map((m, i) => ({
    id: String(m?.id ?? i),
    identity: m?.from?.identity ?? "?",
    name: m?.from?.name || m?.from?.identity || "Someone",
    message: String(m?.message ?? ""),
    ts: Number(m?.timestamp ?? 0),
  }));

  // Group consecutive messages by same sender within 5 min
  type Group = { identity: string; name: string; ts: number; lines: string[] };
  const groups = msgs.reduce<Group[]>((acc, m) => {
    const last = acc[acc.length - 1];
    if (last && last.identity === m.identity && m.ts - last.ts < 5 * 60_000) {
      last.lines.push(m.message);
    } else {
      acc.push({ identity: m.identity, name: m.name, ts: m.ts, lines: [m.message] });
    }
    return acc;
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const handleSend = () => {
    const t = text.trim(); if (!t || isSending) return;
    send(t); setText(""); inputRef.current?.focus();
  };

  return (
    <div className="absolute inset-y-0 right-0 z-40 flex flex-col w-[min(92vw,360px)] shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:w-[300px] border-l flex-shrink-0" style={{ background: "#2b2d31", borderColor: "#1e1f22" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1e1f22" }}>
        <div className="flex items-center gap-2">
          <span className="text-[#b5bac1]">#</span>
          <span className="text-[15px] font-semibold text-white">chat</span>
          {msgs.length > 0 && (
            <span className="bg-[#5865f2] text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold leading-none">{msgs.length}</span>
          )}
        </div>
        <button onClick={onClose} className="text-[#b5bac1] hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👋</p>
            <p className="text-white font-semibold">Welcome to #chat!</p>
            <p className="text-[#b5bac1] text-sm mt-1">No messages yet. Say hello!</p>
          </div>
        )}
        {groups.map((g, i) => {
          const time = (() => {
            try { const d = new Date(g.ts); return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
            catch { return ""; }
          })();
          return (
            <div key={i} className="flex gap-3 group/msg">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {(g.name?.[0] ?? "?").toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[14px] font-semibold text-white hover:underline cursor-pointer">{g.name}</span>
                  <span className="text-[11px] text-[#4e5058]">{time}</span>
                </div>
                {g.lines.map((line, li) => (
                  <p key={li} className="text-[14px] text-[#dbdee1] break-words leading-[1.375rem]">{line}</p>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t" style={{ borderColor: "#1e1f22" }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "#383a40" }}>
          <input
            ref={inputRef} type="text" value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message #chat"
            className="flex-1 bg-transparent text-[14px] text-white placeholder-[#4e5058] outline-none"
          />
          <button onClick={handleSend} disabled={!text.trim() || isSending}
            className="text-[#b5bac1] hover:text-white disabled:opacity-40 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  EMOJI REACTIONS — Floating overlay
// ═══════════════════════════════════════════════════════════════════

function EmojiOverlay({ items }: { items: FloatEmoji[] }) {
  return (
    <>
      <style>{`@keyframes floatUp { 0%{opacity:1;transform:translateY(0) scale(1)} 70%{opacity:1} 100%{opacity:0;transform:translateY(-140px) scale(2.2)} }`}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {items.map(r => (
          <div key={r.id} style={{ position: "absolute", left: `${r.x}%`, bottom: 80, fontSize: 32, animation: "floatUp 3s ease-out forwards", userSelect: "none" }}>
            {r.emoji}
          </div>
        ))}
      </div>
    </>
  );
}

function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-14 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 rounded-2xl border p-3 shadow-2xl" style={{ background: "#2b2d31", borderColor: "#3f4147" }}>
        <div className="grid grid-cols-4 gap-1 sm:flex sm:gap-2">
          {EMOJI_LIST.map(e => (
            <button key={e} onClick={() => { onPick(e); onClose(); }}
              className="text-2xl hover:scale-125 transition-transform p-1 rounded-xl hover:bg-white/10">
              {e}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  BOTTOM CONTROL BAR — Discord style
// ═══════════════════════════════════════════════════════════════════

function AdminModerationMenu({
  speakingMode,
  pendingParticipants,
  onMuteAll,
  onUnmuteAll,
  onToggleSpeakingMode,
  onApprove,
}: {
  speakingMode: boolean;
  pendingParticipants: Array<{ identity: string; name: string }>;
  onMuteAll(): void;
  onUnmuteAll(): void;
  onToggleSpeakingMode(): void;
  onApprove(identity: string): void;
}) {
  const [open, setOpen] = useState(false);
  const pendingHands = pendingParticipants.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        title="Admin moderation"
        className={cn(
          "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
          speakingMode ? "bg-amber-500/20 text-amber-300" : "bg-[#383a40] text-[#b5bac1] hover:bg-white/10 hover:text-white",
        )}
      >
        <Shield className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Moderation</span>
        {pendingHands > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-amber-400 px-1 text-center text-[10px] font-bold text-amber-950">{pendingHands}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-[#3f4147] bg-[#18191c] p-1.5 shadow-2xl">
            <div className="px-2.5 pb-2 pt-1">
              <p className="text-xs font-semibold text-white">Admin controls</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#b5bac1]">Only admins can change who is allowed to speak.</p>
            </div>
            <button onClick={() => { onToggleSpeakingMode(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10">
              <Hand className="h-4 w-4 text-amber-300" />
              {speakingMode ? "Turn off raise-hand mode" : "Require hand raise to speak"}
            </button>
            <button onClick={() => { onMuteAll(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10">
              <VolumeX className="h-4 w-4 text-red-300" /> Mute everyone
            </button>
            <button onClick={() => { onUnmuteAll(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10">
              <Volume2 className="h-4 w-4 text-emerald-300" /> Allow everyone to speak
            </button>
            {(speakingMode || pendingHands > 0) && (
              <div className="mt-1 border-t border-[#3f4147] pt-1">
                <p className="px-2.5 pb-1 pt-1 text-[11px] text-amber-300">{pendingHands ? `${pendingHands} hand${pendingHands === 1 ? "" : "s"} waiting` : "No hands raised"}</p>
                {pendingParticipants.map((participant) => (
                  <button key={participant.identity} onClick={() => { onApprove(participant.identity); setOpen(false); }} className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#dbdee1] hover:bg-emerald-600/20">
                    <span className="truncate">{participant.name}</span>
                    <span className="flex-shrink-0 text-emerald-300">Allow</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ControlBar({
  localP, micOn, camOn, screenOn, deafened, showChat, showSidebar, handUp, micBlocked,
  showEmoji, onMic, onCam, onScreen, onDeafen, onChat, onSidebar, onHand,
  onEmoji, onLeave, onEnd, onInvite, isHost,
}: {
  localP: any; micOn: boolean; camOn: boolean; screenOn: boolean; deafened: boolean;
  showChat: boolean; showSidebar: boolean; handUp: boolean; micBlocked: boolean; showEmoji: boolean;
  onMic(): void; onCam(): void; onScreen(): void; onDeafen(): void;
  onChat(): void; onSidebar(): void; onHand(): void; onEmoji(): void;
  onLeave(): void; onEnd(): void; onInvite(): void; isHost: boolean;
}) {
  const meta = safeMeta(localP?.metadata);
  const name = safeName(localP);
  const [showMore, setShowMore] = useState(false);

  function Btn({ icon: Icon, label, active, danger, onClick, badge }: {
    icon: React.ElementType; label: string; active?: boolean; danger?: boolean;
    onClick(): void; badge?: boolean;
  }) {
    return (
      <div className="relative group/ctrl flex flex-col items-center">
        <button onClick={onClick} title={label}
          className={cn(
            "p-1.5 sm:p-2.5 rounded-xl transition-all active:scale-95 focus:outline-none relative",
            danger ? "bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white"
            : active ? "bg-white/10 hover:bg-white/20 text-white"
            : "hover:bg-white/5 text-[#b5bac1] hover:text-white"
          )}>
          <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          {badge && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#232428]" />}
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 opacity-0 group-hover/ctrl:opacity-100 pointer-events-none transition-opacity z-50">
          <div className="bg-[#111214] text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-xl border border-[#3f4147]">{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 sm:px-3 min-h-[64px] sm:h-14 flex-shrink-0 overflow-visible" style={{ background: "#232428", borderTop: "1px solid #1e1f22" }}>
      {/* Left: User info */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none min-w-0 sm:w-[200px]">
        <Avatar imageUrl={meta.imageUrl} name={name} size="sm" speaking={false} />
        <div className="min-w-0 hidden sm:block">
          <p className="text-[13px] font-semibold text-white truncate">{name}</p>
          <p className="text-[11px] text-[#b5bac1] truncate">{micOn ? "🎤 Live" : "🔇 Muted"}</p>
        </div>
        <button onClick={onInvite} title="Copy invite link" className="ml-1 hidden sm:block p-1.5 rounded-lg text-[#b5bac1] hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Center: Main controls */}
      <div className="flex items-center justify-center gap-0 sm:gap-0.5 flex-none sm:flex-1">
        {micBlocked
          ? <Btn icon={Hand} label={handUp ? "Cancel speaking request" : "Request to speak"} active={handUp} onClick={onHand} badge={handUp} />
          : <Btn icon={micOn ? Mic : MicOff} label={micOn ? "Mute" : "Unmute"} active={micOn} onClick={onMic} />}
        <Btn icon={camOn ? VideoIcon : VideoOff} label={camOn ? "Turn Off Camera" : "Turn On Camera"} active={camOn} onClick={onCam} />
        <Btn icon={screenOn ? MonitorOff : Monitor} label={screenOn ? "Stop Sharing" : "Share Screen"} active={screenOn} onClick={onScreen} />
        <div className="hidden sm:block"><Btn icon={deafened ? VolumeX : Headphones} label={deafened ? "Undeafen" : "Deafen"} active={!deafened} onClick={onDeafen} /></div>
        {!micBlocked && <div className="hidden sm:block"><Btn icon={Hand} label={handUp ? "Lower Hand" : "Raise Hand"} active={handUp} onClick={onHand} badge={handUp} /></div>}
        <div className="hidden sm:block"><Btn icon={Smile} label="React with Emoji" active={showEmoji} onClick={onEmoji} /></div>

        <div className="hidden sm:block h-6 w-px bg-[#3f4147] mx-1.5" />

        <Btn icon={MessageSquare} label="Chat" active={showChat} onClick={onChat} />
        <Btn icon={Users} label="Members" active={showSidebar} onClick={onSidebar} />

        {/* Secondary actions live in a compact menu on phones, like Discord. */}
        <div className="relative sm:hidden">
          <button onClick={() => setShowMore(v => !v)} title="More call actions"
            className="p-1.5 rounded-xl text-[#b5bac1] hover:bg-white/10 hover:text-white transition-colors">
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>
          {showMore && (
            <div className="absolute bottom-12 right-0 z-50 w-48 rounded-xl border border-[#3f4147] bg-[#18191c] p-1.5 shadow-2xl">
              <button onClick={() => { onDeafen(); setShowMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10"><Headphones className="h-4 w-4" /> {deafened ? "Undeafen" : "Deafen"}</button>
              <button onClick={() => { onHand(); setShowMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10"><Hand className="h-4 w-4" /> {micBlocked ? (handUp ? "Cancel request" : "Request to speak") : (handUp ? "Lower hand" : "Raise hand")}</button>
              <button onClick={() => { onEmoji(); setShowMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10"><Smile className="h-4 w-4" /> React</button>
              <button onClick={() => { onInvite(); setShowMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#dbdee1] hover:bg-white/10"><Link2 className="h-4 w-4" /> Copy invite</button>
              {isHost && <button onClick={() => { onEnd(); setShowMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-300 hover:bg-red-600/20"><PhoneOff className="h-4 w-4" /> End for all</button>}
            </div>
          )}
        </div>
      </div>

      {/* Right: Leave */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0 sm:w-[200px]">
        {isHost && (
          <button onClick={onEnd} title="End meeting for everyone"
            className="hidden sm:flex items-center gap-2 bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white text-[13px] font-semibold px-3 py-2 rounded-xl transition-all active:scale-95">
            <PhoneOff className="h-4 w-4" />
            <span className="hidden md:inline">End for all</span>
          </button>
        )}
          <button onClick={onLeave}
          className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-2.5 sm:px-4 py-2 rounded-xl transition-all active:scale-95">
          <PhoneOff className="h-4 w-4" />
          <span className="hidden md:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ROOM CONTENT — All LiveKit hooks + main layout
// ═══════════════════════════════════════════════════════════════════

function RoomContent({ roomName, isHost, onLeave, onEnd }: { roomName: string; isHost: boolean; onLeave(): void; onEnd(): void }) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const remoteParticipants = useParticipants();
  const activeSpeakers = useSpeakingParticipants();

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [moderation, setModeration] = useState(() => parseModerationState(room.metadata));
  const [floatEmojis, setFloatEmojis] = useState<FloatEmoji[]>([]);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Sidebar starts collapsed for full-screen call experience

  // Tracks
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: false });

  const activeScreen = screenTracks[0] ?? null;
  const speakerIds = useMemo(() => new Set(activeSpeakers.map((s: any) => (s?.identity ?? "") as string)) as Set<string>, [activeSpeakers]);
  const allP = useMemo(() => [localParticipant, ...remoteParticipants.filter(p => p?.identity !== localParticipant?.identity)].filter(Boolean), [localParticipant, remoteParticipants]);
  const getTrack = useCallback((p: any) => cameraTracks.find(t => t?.participant?.identity === p?.identity), [cameraTracks]);
  const approvedSpeakers = useMemo(() => new Set(moderation.approvedSpeakers), [moderation.approvedSpeakers]);
  const speakingMode = moderation.requireRaiseHand;
  const myIdentity = localParticipant?.identity ?? "";
  const myApproved = isHost || !speakingMode || approvedSpeakers.has(myIdentity);
  const micBlocked = !isHost && !canPublishAudio(localParticipant);

  useEffect(() => {
    const updateModeration = (metadata: string) => setModeration(parseModerationState(metadata));
    setModeration(parseModerationState(room.metadata));
    room.on(RoomEvent.RoomMetadataChanged, updateModeration);
    return () => { room.off(RoomEvent.RoomMetadataChanged, updateModeration); };
  }, [room]);

  const previousMicBlocked = useRef(micBlocked);
  useEffect(() => {
    if (!isHost && micBlocked && isMicrophoneEnabled) {
      localParticipant.setMicrophoneEnabled(false).catch(() => {});
    }
    if (!isHost && previousMicBlocked.current && !micBlocked && !isMicrophoneEnabled) {
      localParticipant.setMicrophoneEnabled(true).catch(() => {});
      toast.success("The admin allowed you to speak", { duration: 3500 });
    }
    previousMicBlocked.current = micBlocked;
  }, [isHost, micBlocked, isMicrophoneEnabled, localParticipant]);

  // Data messages: hand raise + emoji reactions
  useEffect(() => {
    const handler = (payload: Uint8Array) => {
      try {
        const d: DataMsg = JSON.parse(new TextDecoder().decode(payload));
        if (d.type === "hand") {
          setRaisedHands(prev => { const n = new Set(prev); d.raised ? n.add(d.identity) : n.delete(d.identity); return n; });
        } else if (d.type === "reaction" && d.emoji) {
          const r: FloatEmoji = { id: `${Date.now()}-${Math.random()}`, emoji: d.emoji, x: 10 + Math.random() * 80, name: d.name ?? "Someone" };
          setFloatEmojis(prev => [...prev, r]);
          setTimeout(() => setFloatEmojis(prev => prev.filter(x => x.id !== r.id)), 3200);
        } else if (d.type === "lower-hand") {
          setRaisedHands(prev => { const n = new Set(prev); n.delete(d.identity); return n; });
        }
      } catch {}
    };
    room.on(RoomEvent.DataReceived, handler);
    return () => { room.off(RoomEvent.DataReceived, handler); };
  }, [room]);

  // Send data helper — tries modern API, falls back to legacy
  const sendData = useCallback((data: DataMsg) => {
    try {
      const enc = new TextEncoder().encode(JSON.stringify(data));
      (localParticipant as any).publishData(enc, { reliable: true });
    } catch {
      try {
        const enc = new TextEncoder().encode(JSON.stringify(data));
        (localParticipant as any).publishData(enc, 1);
      } catch {}
    }
  }, [localParticipant]);

  const myHandUp = raisedHands.has(localParticipant?.identity ?? "");

  // Control handlers — errors are shown as toasts; no pre-flight guard that blocks everything
  const toggleMic = useCallback(async () => {
    if (!isHost && micBlocked && !isMicrophoneEnabled) {
      toast("Raise your hand and wait for the admin to allow you to speak", { icon: "✋", duration: 3500 });
      return;
    }
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (e: any) {
      const msg: string = e?.message || e?.name || "";
      if (msg.includes("Permission denied") || msg.includes("NotAllowed") || msg.includes("cancel")) {
        toast.error("Microphone permission was blocked. Allow Microphone in the browser address-bar settings, then try again.", { duration: 8000 });
        return;
      }
      if (typeof navigator === "undefined" || !navigator.mediaDevices || msg.includes("undefined")) {
        toast.error("Microphone needs an HTTPS meeting link (or localhost). Open the HTTPS invite, then try again.", { duration: 8000 });
      } else {
        toast.error("Mic error: " + (msg || "Failed to toggle microphone"), { duration: 5000 });
      }
    }
  }, [isHost, micBlocked, localParticipant, isMicrophoneEnabled]);

  const toggleCamera = useCallback(async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (e: any) {
      const msg: string = e?.message || e?.name || "";
      if (msg.includes("Permission denied") || msg.includes("NotAllowed") || msg.includes("cancel")) {
        toast.error("Camera permission was blocked. Allow Camera in the browser address-bar settings, then try again.", { duration: 8000 });
        return;
      }
      if (typeof navigator === "undefined" || !navigator.mediaDevices || msg.includes("undefined")) {
        toast.error("Camera needs an HTTPS meeting link (or localhost). Open the HTTPS invite, then try again.", { duration: 8000 });
      } else {
        toast.error("Camera error: " + (msg || "Failed to toggle camera"), { duration: 5000 });
      }
    }
  }, [localParticipant, isCameraEnabled]);

  const toggleScreen = useCallback(async () => {
    try {
      // Pass audio: true to capture system/tab audio along with screen video
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, { audio: true, systemAudio: "include" });
      if (!isScreenShareEnabled) toast.success("Screen sharing started (with audio)");
    } catch (e: any) {
      const msg: string = e?.message || e?.name || "";
      if (msg.includes("Permission denied") || msg.includes("NotAllowed") || msg.includes("cancel")) {
        toast.error("Screen sharing was cancelled or blocked. Choose a window or screen and allow sharing, then try again.", { duration: 8000 });
        return;
      }
      if (typeof navigator === "undefined" || !navigator.mediaDevices || msg.includes("undefined")) {
        toast.error("Screen sharing needs an HTTPS meeting link (or localhost). Open the HTTPS invite, then try again.", { duration: 8000 });
      } else {
        toast.error("Screen share failed: " + (msg || "Check browser permissions"), { duration: 5000 });
      }
    }
  }, [localParticipant, isScreenShareEnabled]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(d => {
      if (!d && isMicrophoneEnabled) localParticipant.setMicrophoneEnabled(false).catch(() => {});
      return !d;
    });
  }, [isMicrophoneEnabled, localParticipant]);

  const toggleHand = useCallback(() => {
    const id = localParticipant?.identity ?? "";
    const willRaise = !myHandUp;
    setRaisedHands(prev => { const n = new Set(prev); willRaise ? n.add(id) : n.delete(id); return n; });
    sendData({ type: "hand", identity: id, raised: willRaise });
    if (willRaise) toast("✋ Hand raised", { duration: 2000 });
  }, [myHandUp, localParticipant, sendData]);

  const sendReaction = useCallback((emoji: string) => {
    const id = localParticipant?.identity ?? "";
    const name = safeName(localParticipant);
    sendData({ type: "reaction", identity: id, name, emoji });
    const r: FloatEmoji = { id: `local-${Date.now()}`, emoji, x: 30 + Math.random() * 40, name };
    setFloatEmojis(prev => [...prev, r]);
    setTimeout(() => setFloatEmojis(prev => prev.filter(x => x.id !== r.id)), 3200);
  }, [localParticipant, sendData]);

  const handleAdmin = useCallback(async (action: string, identity: string) => {
    if (action === "lower-hand") {
      setRaisedHands(prev => { const n = new Set(prev); n.delete(identity); return n; });
      sendData({ type: "lower-hand", identity });
      return;
    }
    const tid = toast.loading(action === "kick" ? "Removing…" : action === "mute" ? "Muting…" : "Unmuting…");
    try {
      const result = await doAdmin(action, roomName, identity, { requesterIdentity: localParticipant?.identity });
      if (result?.moderation) setModeration(result.moderation);
      toast.success(action === "kick" ? "Removed" : action === "mute" ? "Muted" : action === "approve-speaker" ? "Permission granted" : action === "revoke-speaker" ? "Permission revoked" : "Unmuted", { id: tid });
    } catch (e: any) { toast.error(e?.message || "Failed", { id: tid }); }
  }, [roomName, sendData, localParticipant]);

  const runModerationAction = useCallback(async (action: "mute-all" | "unmute-all" | "set-speaking-mode", enabled?: boolean) => {
    if (action === "mute-all" && !window.confirm("Mute every participant except you?")) return;
    const tid = toast.loading(action === "mute-all" ? "Muting everyoneâ€¦" : action === "unmute-all" ? "Allowing everyone to speakâ€¦" : enabled ? "Enabling raise-hand modeâ€¦" : "Disabling raise-hand modeâ€¦");
    try {
      const result = await doAdmin(action, roomName, "", {
        requesterIdentity: localParticipant?.identity,
        ...(action === "set-speaking-mode" ? { enabled } : {}),
      });
      if (result?.moderation) setModeration(result.moderation);
      if (action === "mute-all") toast.success("Everyone is muted", { id: tid });
      else if (action === "unmute-all") toast.success("Everyone can speak", { id: tid });
      else toast.success(enabled ? "Raise-hand mode is on" : "Raise-hand mode is off", { id: tid });
    } catch (e: any) { toast.error(e?.message || "Moderation action failed", { id: tid }); }
  }, [roomName, localParticipant]);

  const handleLeave = useCallback(async () => {
    try { await room.disconnect(true); } catch {}
    onLeave();
  }, [room, onLeave]);

  const copyInvite = useCallback(() => {
    const link = `${window.location.origin}/meet/${roomName}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Invite link copied!", { icon: "🔗" }))
      .catch(() => toast.error("Could not copy link"));
  }, [roomName]);

  // Layout: featured view (screen share or pinned) vs. grid
  const pinnedP = pinnedId ? allP.find(p => p?.identity === pinnedId) ?? null : null;
  const showFeatured = !!activeScreen || !!pinnedP;
  const featuredTrack = activeScreen ?? (pinnedP ? getTrack(pinnedP) : null);
  const featuredLabel = activeScreen ? `${safeName(activeScreen?.participant)} is sharing their screen` : pinnedP ? `📌 ${safeName(pinnedP)}` : "";
  const featuredHasVideo = !!featuredTrack && "publication" in featuredTrack && featuredTrack.publication?.isEnabled && featuredTrack.publication?.track;

  const count = allP.length;
  const gridClass = count === 1 ? "grid-cols-1 max-w-2xl mx-auto w-full"
    : count === 2 ? "grid-cols-1 sm:grid-cols-2"
    : count <= 4 ? "grid-cols-2"
    : count <= 6 ? "grid-cols-3"
    : count <= 9 ? "grid-cols-3"
    : "grid-cols-4";

  return (
    <div className="flex min-h-0 flex-col h-full overflow-hidden" style={{ background: "#1e1f22" }}>
      <Toaster position="top-center" toastOptions={{ style: { background: "#2b2d31", color: "#fff", border: "1px solid #3f4147", borderRadius: 12 } }} />

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: "#2b2d31", borderBottom: "1px solid #1e1f22" }}>
        <div className="flex items-center gap-3">
          {/* Mobile hamburger to toggle sidebar */}
          <button onClick={() => setMobileSidebar(v => !v)} className="lg:hidden p-1.5 rounded-lg text-[#b5bac1] hover:text-white hover:bg-white/5 transition-colors">
            <Menu className="h-4 w-4" />
          </button>
          {/* Desktop sidebar toggle */}
          <button onClick={() => setShowSidebar(v => !v)} className="hidden lg:flex p-1.5 rounded-lg text-[#b5bac1] hover:text-white hover:bg-white/5 transition-colors">
            <Users className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[14px] font-semibold text-white hidden sm:inline">Voice Connected</span>
            {isHost && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 rounded px-2 py-0.5">
                <Crown className="h-3 w-3 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400">HOST</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <AdminModerationMenu
              speakingMode={speakingMode}
              pendingParticipants={allP
                .filter((participant) => raisedHands.has(participant?.identity ?? "") && !approvedSpeakers.has(participant?.identity ?? "") && participant?.identity !== localParticipant?.identity)
                .map((participant) => ({ identity: participant.identity, name: safeName(participant) }))}
              onMuteAll={() => runModerationAction("mute-all")}
              onUnmuteAll={() => runModerationAction("unmute-all")}
              onToggleSpeakingMode={() => runModerationAction("set-speaking-mode", !speakingMode)}
              onApprove={(identity) => handleAdmin("approve-speaker", identity)}
            />
          )}
          <div className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs" style={{ background: "#383a40", color: "#b5bac1" }}>
            <Users className="h-3.5 w-3.5" />
            <span>{allP.length}</span>
          </div>
          <button onClick={copyInvite} title="Copy invite link"
            className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors hover:bg-white/10" style={{ background: "#383a40", color: "#b5bac1" }}>
            <Link2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        {showSidebar && (
          <div className="hidden lg:flex flex-col">
            <LeftSidebar
              all={allP} localId={localParticipant?.identity ?? ""} isHost={isHost}
              roomName={roomName} raisedHands={raisedHands} speakerIds={speakerIds}
              speakingMode={speakingMode} approvedSpeakers={approvedSpeakers}
              onAdmin={handleAdmin} onPin={setPinnedId}
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {mobileSidebar && (
          <div className="lg:hidden absolute inset-0 z-40 flex">
            <LeftSidebar
              all={allP} localId={localParticipant?.identity ?? ""} isHost={isHost}
              roomName={roomName} raisedHands={raisedHands} speakerIds={speakerIds}
              speakingMode={speakingMode} approvedSpeakers={approvedSpeakers}
              onAdmin={handleAdmin} onPin={(id) => { setPinnedId(id); setMobileSidebar(false); }}
              onClose={() => setMobileSidebar(false)}
            />
            <div className="flex-1 bg-black/60" onClick={() => setMobileSidebar(false)} />
          </div>
        )}

        {/* Main video area */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3">
          <EmojiOverlay items={floatEmojis} />
          {showEmoji && <EmojiPicker onPick={sendReaction} onClose={() => setShowEmoji(false)} />}

          {showFeatured ? (
            <>
              {/* Featured */}
              <div className="flex-1 min-h-0 rounded-xl overflow-hidden relative" style={{ background: "#000" }}>
                {featuredHasVideo
                  ? <VideoTrack trackRef={featuredTrack as any} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : (
                    <div className="w-full h-full flex items-center justify-center">
                      {pinnedP && <Avatar imageUrl={safeMeta(pinnedP?.metadata).imageUrl} name={safeName(pinnedP)} size="lg" />}
                    </div>
                  )
                }
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-sky-600/90 rounded-lg px-2 py-1 sm:px-2.5 text-[10px] sm:text-xs text-white font-semibold flex items-center gap-1.5 max-w-[calc(100%-3rem)]">
                  <Monitor className="h-3.5 w-3.5" />{featuredLabel}
                </div>
                <button onClick={() => { setPinnedId(null); }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors" title="Exit featured view">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom participant strip */}
              <div className="flex gap-2 overflow-x-auto flex-shrink-0 pb-1">
                {allP.map(p => (
                  <div key={p?.identity} className="flex-shrink-0 w-40">
                    <ParticipantTile
                      participant={p} trackRef={getTrack(p)}
                      isLocal={p?.identity === localParticipant?.identity} isHost={isHost}
                      isHostTile={isHost && p?.identity === localParticipant?.identity}
                      roomName={roomName} isPinned={pinnedId === p?.identity}
                      handRaised={raisedHands.has(p?.identity ?? "")}
                      speaking={speakerIds.has(p?.identity ?? "")}
                      onPin={() => setPinnedId(p?.identity)} onUnpin={() => setPinnedId(null)}
                      onAdmin={handleAdmin}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Normal grid */
            <div className={cn("grid min-h-0 h-full content-center gap-2 overflow-y-auto sm:gap-3", gridClass)}>
              {allP.map(p => (
                <ParticipantTile
                  key={p?.identity} participant={p} trackRef={getTrack(p)}
                  isLocal={p?.identity === localParticipant?.identity} isHost={isHost}
                  isHostTile={isHost && p?.identity === localParticipant?.identity}
                  roomName={roomName} isPinned={pinnedId === p?.identity}
                  handRaised={raisedHands.has(p?.identity ?? "")}
                  speaking={speakerIds.has(p?.identity ?? "")}
                  onPin={() => setPinnedId(p?.identity)} onUnpin={() => setPinnedId(null)}
                  onAdmin={handleAdmin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Chat */}
        {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
      </div>

      {/* ── Bottom control bar ─────────────────────────────── */}
      <ControlBar
        localP={localParticipant} micOn={isMicrophoneEnabled} camOn={isCameraEnabled}
        screenOn={isScreenShareEnabled} deafened={isDeafened} showChat={showChat}
        showSidebar={showSidebar || mobileSidebar} handUp={myHandUp} micBlocked={micBlocked} showEmoji={showEmoji} isHost={isHost}
        onMic={toggleMic} onCam={toggleCamera} onScreen={toggleScreen} onDeafen={toggleDeafen}
        onChat={() => setShowChat(v => !v)} onSidebar={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1024) setMobileSidebar(v => !v);
          else setShowSidebar(v => !v);
        }}
        onHand={toggleHand} onEmoji={() => setShowEmoji(v => !v)}
        onLeave={handleLeave} onEnd={onEnd} onInvite={copyInvite}
      />

      {!isDeafened && <RoomAudioRenderer />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PUBLIC EXPORT
// ═══════════════════════════════════════════════════════════════════

// ─── Room audio quality ────────────────────────────────────────────────────
// Browser built-in noise suppression + LiveKit server-side AI noise suppression
// running together causes double-processing → "robotic / underwater" voice.
// We disable the browser-side processing and let LiveKit's server AI handle it.
const ROOM_OPTIONS: RoomOptions = {
  audioCaptureDefaults: {
    noiseSuppression: false,    // ← disable browser noise gate (LiveKit does this)
    autoGainControl: false,     // ← disable browser AGC (LiveKit does this)
    echoCancellation: true,     // keep: prevents echo when not using headphones
    sampleRate: 48000,          // 48kHz — same as Opus standard
    channelCount: 1,            // mono — better quality at given bitrate for voice
  },
  publishDefaults: {
    audioPreset: AudioPresets.musicHighQuality, // 96kbps Opus
    dtx: true,          // Discontinuous Transmission: saves bandwidth on silence gaps
    red: true,          // Redundant audio encoding: recovers dropped packets → less stutter
    simulcast: true,    // adaptive video quality layers
  },
};

export function MeetRoom({ serverUrl, token, roomName, isHost = false, onLeave, onEnd = onLeave }: {
  serverUrl: string; token: string; roomName: string; isHost?: boolean; onLeave(): void; onEnd?: () => void;
}) {
  // isSecureContext = true when on HTTPS or localhost.
  // On plain HTTP with a local IP, navigator.mediaDevices is undefined and auto-starting
  // audio would crash immediately. We skip the auto-start and let the user click the button.
  const secureCtx = typeof window !== "undefined" ? window.isSecureContext : false;
  const hasMediaDevices = typeof navigator !== "undefined" && !!navigator.mediaDevices;
  const needsSecureMedia = !secureCtx || !hasMediaDevices;
  const secureRoomUrl = typeof window !== "undefined"
    ? `https://${window.location.host}${window.location.pathname}${window.location.search}`
    : "";

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio={secureCtx}   // auto-start mic only on HTTPS / localhost
      // video intentionally NOT auto-started — user enables manually (Discord style)
      options={ROOM_OPTIONS}
      onDisconnected={onLeave}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="relative h-full">
        {needsSecureMedia && (
          <div className="absolute left-3 right-3 top-3 z-50 rounded-xl border border-amber-500/40 bg-amber-950/95 px-4 py-3 text-amber-100 shadow-xl">
            <div className="text-sm font-semibold">Camera, microphone, and screen sharing are blocked in this connection</div>
            <div className="mt-1 text-xs leading-relaxed text-amber-200/90">
              Open this meeting over HTTPS (or use localhost), allow the browser permissions, and rejoin. Chat and participant presence can still connect, but browsers do not expose media devices on an HTTP LAN address.
            </div>
            {secureRoomUrl && (
              <a href={secureRoomUrl} className="mt-2 inline-flex rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-300">
                Open secure meeting link
              </a>
            )}
          </div>
        )}
        <RoomContent roomName={roomName} isHost={isHost} onLeave={onLeave} onEnd={onEnd} />
      </div>
    </LiveKitRoom>
  );
}
