"use client";

import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LayoutGrid, MessageCircle, MessagesSquare, Pin, Send, Sparkles } from "lucide-react";

type Settings = {
  communityName: string;
  tagline: string;
  welcomeMessage: string;
  allowStudentPosts: boolean;
  allowStudentComments: boolean;
  requirePostApproval: boolean;
  showMemberCount: boolean;
};

type Space = { id: string; name: string; color: string; postCount: number };
type Comment = { id: string; content: string; authorId: string; createdAt: string };
type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  spaceId: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  isApproved: boolean;
  createdAt: string;
  space: { id: string; name: string; color: string } | null;
  comments: Comment[];
};

type Props = {
  currentUserId: string;
  initialSettings: Settings;
  initialSpaces: Space[];
  initialPosts: Post[];
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data as T;
}

function timeAgo(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(value).toLocaleDateString();
}

function Avatar({ label, accent }: { label: string; accent: string }) {
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: accent }}>{label.slice(0, 1).toUpperCase()}</div>;
}

function PostCard({ post, currentUserId, allowComments, onComment }: { post: Post; currentUserId: string; allowComments: boolean; onComment(postId: string, comment: Comment): void }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      const created = await request<Comment>(`/api/community/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: comment }) });
      onComment(post.id, created);
      setComment("");
      setShowComments(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#eadfd3] bg-white shadow-[0_8px_30px_rgba(113,83,52,0.05)]">
      {post.isAnnouncement && <div className="bg-[#fff7e8] px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a66d2c]">Announcement</div>}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3"><Avatar label={post.authorId === currentUserId ? "Y" : "C"} accent={post.space?.color || "#8299ae"} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-xs text-[#8d7b6b]"><span className="font-bold text-[#4d3929]">{post.authorId === currentUserId ? "You" : "Community member"}</span><span>·</span><span>{timeAgo(post.createdAt)}</span>{post.space && <span className="rounded-full bg-[#f7f1ea] px-2 py-0.5 font-semibold text-[#7d6653]">{post.space.name}</span>}</div><h2 className="mt-2 text-lg font-extrabold tracking-tight text-[#3f3024]">{post.title}</h2></div>{post.isPinned && <Pin className="h-4 w-4 shrink-0 text-[#a66d2c]" />}</div>
        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#66584d]">{post.content}</p>
        <div className="mt-5 flex items-center gap-2 border-t border-[#f1e9e1] pt-4"><button type="button" onClick={() => setShowComments((value) => !value)} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#7e6b5b] transition hover:bg-[#faf5ef] hover:text-[#5b432f]"><MessageCircle className="h-4 w-4" /> {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</button></div>
        {showComments && <div className="mt-4 rounded-xl bg-[#fbf8f4] p-3 sm:p-4"><div className="space-y-3">{post.comments.length === 0 && <p className="text-xs text-[#9d8b7a]">No comments yet. Start the conversation.</p>}{post.comments.map((item) => <div key={item.id} className="flex gap-2.5"><Avatar label={item.authorId === currentUserId ? "Y" : "C"} accent={item.authorId === currentUserId ? "#bd8956" : "#8299ae"} /><div className="min-w-0 flex-1 rounded-xl border border-[#eee4da] bg-white px-3 py-2.5"><div className="flex items-center gap-2 text-[11px] text-[#9d8b7a]"><span className="font-bold text-[#5c4737]">{item.authorId === currentUserId ? "You" : "Community member"}</span><span>·</span><span>{timeAgo(item.createdAt)}</span></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#6b5c50]">{item.content}</p></div></div>)}</div>{allowComments ? <form onSubmit={submitComment} className="mt-4 flex gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-[#e6d9cc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><button disabled={!comment.trim() || sending} type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#6f5138] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#5d422e] disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">Send</span></button></form> : <p className="mt-4 text-xs font-semibold text-[#9d8b7a]">Comments are currently disabled by the teacher.</p>}</div>}
      </div>
    </article>
  );
}

export function StudentCommunity({ currentUserId, initialSettings, initialSpaces, initialPosts }: Props) {
  const [settings] = useState(initialSettings);
  const [spaces] = useState(initialSpaces);
  const [posts, setPosts] = useState(initialPosts);
  const [selectedSpaceId, setSelectedSpaceId] = useState("all");
  const [showComposer, setShowComposer] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postSpaceId, setPostSpaceId] = useState(initialSpaces[0]?.id || "");
  const [saving, setSaving] = useState(false);

  const visiblePosts = useMemo(() => selectedSpaceId === "all" ? posts : posts.filter((post) => post.spaceId === selectedSpaceId), [posts, selectedSpaceId]);

  async function createPost(event: FormEvent) {
    event.preventDefault();
    if (!postTitle.trim() || !postContent.trim() || !postSpaceId || saving) return;
    setSaving(true);
    try {
      const post = await request<Post>("/api/community/posts", { method: "POST", body: JSON.stringify({ title: postTitle, content: postContent, spaceId: postSpaceId }) });
      setPostTitle("");
      setPostContent("");
      setShowComposer(false);
      if (post.isApproved) {
        setPosts((current) => [post, ...current]);
        toast.success("Post published");
      } else {
        toast.success("Post submitted for teacher approval");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function addComment(postId: string, comment: Comment) {
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post));
  }

  return (
    <div className="min-h-screen bg-[#fbf8f4] px-4 pb-12 pt-6 text-[#4d3929] sm:px-6 lg:px-8"><div className="mx-auto max-w-[1250px]">
      <header><div className="inline-flex items-center gap-2 rounded-full border border-[#ead7c1] bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6b43]"><MessagesSquare className="h-3.5 w-3.5" /> Community</div><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-black tracking-tight text-[#3f3024] sm:text-4xl">{settings.communityName}</h1><p className="mt-2 text-sm leading-6 text-[#887768]">{settings.tagline}</p></div>{settings.allowStudentPosts && <button type="button" onClick={() => setShowComposer((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f5138] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(111,81,56,0.18)] transition hover:bg-[#5d422e]"><MessagesSquare className="h-4 w-4" /> Start a discussion</button>}</div></header>
      {settings.welcomeMessage && <section className="mt-7 rounded-3xl bg-[linear-gradient(120deg,#573e2b_0%,#75553d_52%,#a77a52_100%)] p-6 text-white shadow-[0_18px_40px_rgba(111,81,56,0.18)] sm:p-8"><div className="flex items-start gap-3"><Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#f8dfbe]" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f8dfbe]">Welcome</p><p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[#f2dfca]">{settings.welcomeMessage}</p></div></div></section>}
      {settings.showMemberCount && <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#eadfd3] bg-white p-4"><p className="text-xs font-bold text-[#9d8b7a]">Spaces</p><p className="mt-2 text-2xl font-black text-[#4d3929]">{spaces.length}</p></div><div className="rounded-2xl border border-[#eadfd3] bg-white p-4"><p className="text-xs font-bold text-[#9d8b7a]">Discussions</p><p className="mt-2 text-2xl font-black text-[#4d3929]">{posts.length}</p></div><div className="rounded-2xl border border-[#eadfd3] bg-white p-4"><p className="text-xs font-bold text-[#9d8b7a]">Your access</p><p className="mt-2 text-sm font-extrabold text-[#6b8f71]">Member</p></div></div>}
      {showComposer && settings.allowStudentPosts && <form onSubmit={createPost} className="mt-6 rounded-2xl border border-[#e6d4bd] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.06)] sm:p-6"><p className="text-sm font-extrabold text-[#4d3929]">Start a discussion</p><p className="mt-1 text-xs text-[#9d8b7a]">Ask a question, share a win, or help another member.</p><div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_210px]"><input value={postTitle} onChange={(event) => setPostTitle(event.target.value)} placeholder="Discussion title" maxLength={120} className="rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm font-semibold outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><select value={postSpaceId} onChange={(event) => setPostSpaceId(event.target.value)} className="rounded-xl border border-[#e6d9cc] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#bd8956]">{spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}</select></div><textarea value={postContent} onChange={(event) => setPostContent(event.target.value)} placeholder="What would you like to share?" maxLength={10000} rows={5} className="mt-3 w-full resize-y rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><div className="mt-4 flex items-center justify-end gap-2"><button type="button" onClick={() => setShowComposer(false)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#806b59] hover:bg-[#faf5ef]">Cancel</button><button disabled={!postTitle.trim() || !postContent.trim() || !postSpaceId || saving} type="submit" className="rounded-xl bg-[#6f5138] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{saving ? "Publishing..." : "Publish"}</button></div></form>}
      <div className="mt-7 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><aside><div className="rounded-2xl border border-[#eadfd3] bg-white p-3 shadow-[0_8px_30px_rgba(113,83,52,0.04)]"><p className="px-2 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b8878]">Browse spaces</p><button type="button" onClick={() => setSelectedSpaceId("all")} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${selectedSpaceId === "all" ? "bg-[#fbf3e8] text-[#6f5138]" : "text-[#887768] hover:bg-[#faf7f3]"}`}><LayoutGrid className="h-4 w-4" /> All discussions<span className="ml-auto text-xs text-[#ad9b8b]">{posts.length}</span></button><div className="mt-1 space-y-1">{spaces.map((space) => <button type="button" key={space.id} onClick={() => setSelectedSpaceId(space.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${selectedSpaceId === space.id ? "bg-[#fbf3e8] text-[#6f5138]" : "text-[#887768] hover:bg-[#faf7f3]"}`}><span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: space.color }}>#</span><span className="truncate">{space.name}</span><span className="ml-auto text-xs text-[#ad9b8b]">{space.postCount}</span></button>)}</div></div></aside><main className="min-w-0 space-y-5">{visiblePosts.length === 0 ? <div className="rounded-2xl border border-dashed border-[#ddcdbd] bg-white p-10 text-center"><MessagesSquare className="mx-auto h-8 w-8 text-[#bd8956]" /><h2 className="mt-3 text-lg font-extrabold text-[#4d3929]">No discussions here yet</h2><p className="mt-1 text-sm text-[#9d8b7a]">Be the first member to start a conversation.</p></div> : visiblePosts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUserId} allowComments={settings.allowStudentComments} onComment={addComment} />)}</main></div>
    </div></div>
  );
}
