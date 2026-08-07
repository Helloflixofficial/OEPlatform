"use client";

import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Bell,
  Check,
  Hash,
  LayoutGrid,
  MessageCircle,
  MessagesSquare,
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

type Space = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  postCount: number;
};

type Comment = {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
};

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
  updatedAt: string;
  space: { id: string; name: string; color: string } | null;
  comments: Comment[];
};

type Props = {
  initialSpaces: Space[];
  initialPosts: Post[];
  currentUserId: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
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

function Avatar({ label, accent = "#bd8956" }: { label: string; accent?: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm" style={{ background: accent }}>
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  onUpdate,
  onDelete,
  onComment,
}: {
  post: Post;
  currentUserId: string;
  onUpdate(post: Post): void;
  onDelete(id: string): void;
  onComment(postId: string, comment: Comment): void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      const created = await request<Comment>(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: comment }),
      });
      onComment(post.id, created);
      setComment("");
      setShowComments(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  async function togglePin() {
    try {
      const updated = await request<Post>(`/api/community/posts/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });
      onUpdate(updated);
      toast.success(updated.isPinned ? "Post pinned" : "Post unpinned");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function toggleAnnouncement() {
    try {
      const updated = await request<Post>(`/api/community/posts/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAnnouncement: !post.isAnnouncement }),
      });
      onUpdate(updated);
      toast.success(updated.isAnnouncement ? "Marked as announcement" : "Moved to discussion");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function approvePost() {
    try {
      const updated = await request<Post>(`/api/community/posts/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isApproved: true }),
      });
      onUpdate(updated);
      toast.success("Post approved");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function removePost() {
    if (!window.confirm("Delete this post and its comments?")) return;
    try {
      await request(`/api/community/posts/${post.id}`, { method: "DELETE" });
      onDelete(post.id);
      toast.success("Post deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#eadfd3] bg-white shadow-[0_8px_30px_rgba(113,83,52,0.05)]">
      {post.isAnnouncement && <div className="flex items-center gap-2 bg-[#fff7e8] px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a66d2c]"><Megaphone className="h-3.5 w-3.5" /> Announcement</div>}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Avatar label="T" accent={post.space?.color || "#bd8956"} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8d7b6b]">
              <span className="font-bold text-[#4d3929]">You</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              {post.space && <span className="rounded-full bg-[#f7f1ea] px-2 py-0.5 font-semibold text-[#7d6653]">{post.space.name}</span>}
            </div>
            <h3 className="mt-2 text-lg font-extrabold tracking-tight text-[#3f3024]">{post.title}</h3>
            {!post.isApproved && <span className="mt-2 inline-flex rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#a66d2c]">Pending approval</span>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={togglePin} title={post.isPinned ? "Unpin post" : "Pin post"} className={`rounded-lg p-2 transition ${post.isPinned ? "bg-[#fff2d8] text-[#a66d2c]" : "text-[#9d8b7a] hover:bg-[#faf5ef] hover:text-[#6f5138]"}`}>
              {post.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
            <button type="button" onClick={removePost} title="Delete post" className="rounded-lg p-2 text-[#b6a295] transition hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>

        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#66584d]">{post.content}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#f1e9e1] pt-4">
          <button type="button" onClick={() => setShowComments((value) => !value)} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#7e6b5b] transition hover:bg-[#faf5ef] hover:text-[#5b432f]"><MessageCircle className="h-4 w-4" /> {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</button>
          <button type="button" onClick={toggleAnnouncement} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#7e6b5b] transition hover:bg-[#faf5ef] hover:text-[#5b432f]"><Bell className="h-4 w-4" /> {post.isAnnouncement ? "Discussion post" : "Make announcement"}</button>
          {!post.isApproved && <button type="button" onClick={approvePost} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#62836a] transition hover:bg-[#f1f8f2]"><Check className="h-4 w-4" /> Approve</button>}
          {post.isPinned && <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#a66d2c]"><Pin className="h-3 w-3" /> Pinned</span>}
        </div>

        {showComments && (
          <div className="mt-4 rounded-xl bg-[#fbf8f4] p-3 sm:p-4">
            <div className="space-y-3">
              {post.comments.length === 0 && <p className="text-xs text-[#9d8b7a]">No comments yet. Start the conversation.</p>}
              {post.comments.map((item) => (
                <div key={item.id} className="flex gap-2.5">
                  <Avatar label={item.authorId === currentUserId ? "T" : "C"} accent={item.authorId === currentUserId ? "#bd8956" : "#8299ae"} />
                  <div className="min-w-0 flex-1 rounded-xl border border-[#eee4da] bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-[#9d8b7a]"><span className="font-bold text-[#5c4737]">{item.authorId === currentUserId ? "You" : "Community member"}</span><span>·</span><span>{timeAgo(item.createdAt)}</span></div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#6b5c50]">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="mt-4 flex gap-2">
              <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-[#e6d9cc] bg-white px-3 py-2.5 text-sm text-[#4d3929] outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" />
              <button disabled={!comment.trim() || sending} type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#6f5138] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#5d422e] disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Send</span></button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

export function CommunityDashboard({ initialSpaces, initialPosts, currentUserId }: Props) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [posts, setPosts] = useState(initialPosts);
  const [selectedSpaceId, setSelectedSpaceId] = useState("all");
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postSpaceId, setPostSpaceId] = useState(initialSpaces[0]?.id || "");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [saving, setSaving] = useState(false);

  const visiblePosts = useMemo(
    () => selectedSpaceId === "all" ? posts : posts.filter((post) => post.spaceId === selectedSpaceId),
    [posts, selectedSpaceId],
  );
  const commentCount = useMemo(() => posts.reduce((total, post) => total + post.comments.length, 0), [posts]);

  async function createSpace(event: FormEvent) {
    event.preventDefault();
    if (!spaceName.trim() || saving) return;
    setSaving(true);
    try {
      const space = await request<Space>("/api/community/spaces", { method: "POST", body: JSON.stringify({ name: spaceName, description: spaceDescription }) });
      setSpaces((current) => [...current, space]);
      setPostSpaceId(space.id);
      setSpaceName("");
      setSpaceDescription("");
      setShowSpaceForm(false);
      toast.success("Space created");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function createPost(event: FormEvent) {
    event.preventDefault();
    if (!postTitle.trim() || !postContent.trim() || !postSpaceId || saving) return;
    setSaving(true);
    try {
      const post = await request<Post>("/api/community/posts", { method: "POST", body: JSON.stringify({ title: postTitle, content: postContent, spaceId: postSpaceId, isAnnouncement }) });
      setPosts((current) => [post, ...current]);
      setSpaces((current) => current.map((space) => space.id === post.spaceId ? { ...space, postCount: space.postCount + 1 } : space));
      setPostTitle("");
      setPostContent("");
      setIsAnnouncement(false);
      setShowComposer(false);
      toast.success(isAnnouncement ? "Announcement published" : "Post published");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function updatePost(updated: Post) {
    setPosts((current) => current.map((post) => post.id === updated.id ? updated : post));
  }

  function deletePost(id: string) {
    const deleted = posts.find((post) => post.id === id);
    setPosts((current) => current.filter((post) => post.id !== id));
    if (deleted) setSpaces((current) => current.map((space) => space.id === deleted.spaceId ? { ...space, postCount: Math.max(0, space.postCount - 1) } : space));
  }

  function addComment(postId: string, comment: Comment) {
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post));
  }

  return (
    <div className="min-h-screen bg-[#fbf8f4] px-4 pb-12 pt-6 text-[#4d3929] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ead7c1] bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6b43]"><MessagesSquare className="h-3.5 w-3.5" /> Teaching workspace</div>
            <h1 className="text-3xl font-black tracking-tight text-[#3f3024] sm:text-4xl">Community</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#887768]">Create a home for conversation, announcements, and member support around your courses.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/teacher/community/settings" title="Community settings" aria-label="Community settings" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5d4c2] bg-white text-[#80644d] shadow-sm transition hover:border-[#bd8956] hover:bg-[#fffaf4]"><Settings className="h-4 w-4" /></Link>
            <button type="button" onClick={() => setShowComposer((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f5138] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(111,81,56,0.18)] transition hover:bg-[#5d422e]"><Plus className="h-4 w-4" /> Create post</button>
          </div>
        </header>

        <section className="mt-7 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#573e2b_0%,#75553d_52%,#a77a52_100%)] p-6 text-white shadow-[0_18px_40px_rgba(111,81,56,0.18)] sm:p-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#f8dfbe]"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Your community HQ</span></div>
              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Turn your audience into a community.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#f2dfca]">Use spaces to organize conversations, keep important announcements visible, and give members one place to ask questions.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[{ label: "Spaces", value: spaces.length, icon: LayoutGrid }, { label: "Posts", value: posts.length, icon: MessagesSquare }, { label: "Comments", value: commentCount, icon: MessageCircle }].map(({ label, value, icon: Icon }) => (
                <div key={label} className="min-w-[78px] rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:min-w-[100px] sm:p-4"><Icon className="h-4 w-4 text-[#f8dfbe]" /><p className="mt-3 text-xl font-black">{value}</p><p className="mt-0.5 text-[11px] font-semibold text-[#efd9bf]">{label}</p></div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)_250px]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#eadfd3] bg-white p-3 shadow-[0_8px_30px_rgba(113,83,52,0.04)]">
              <div className="flex items-center justify-between px-2 pb-2"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b8878]">Spaces</p><button type="button" onClick={() => setShowSpaceForm((value) => !value)} className="rounded-lg p-1.5 text-[#9b6b43] transition hover:bg-[#faf5ef]" title="Create space">{showSpaceForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</button></div>
              <button type="button" onClick={() => setSelectedSpaceId("all")} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${selectedSpaceId === "all" ? "bg-[#fbf3e8] text-[#6f5138]" : "text-[#887768] hover:bg-[#faf7f3]"}`}><LayoutGrid className="h-4 w-4" /> All posts <span className="ml-auto text-xs text-[#ad9b8b]">{posts.length}</span></button>
              <div className="mt-1 space-y-1">
                {spaces.map((space) => <button type="button" key={space.id} onClick={() => setSelectedSpaceId(space.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${selectedSpaceId === space.id ? "bg-[#fbf3e8] text-[#6f5138]" : "text-[#887768] hover:bg-[#faf7f3]"}`}><span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: space.color }}>#</span><span className="truncate">{space.name}</span><span className="ml-auto text-xs text-[#ad9b8b]">{space.postCount}</span></button>)}
              </div>
              {showSpaceForm && <form onSubmit={createSpace} className="mt-3 border-t border-[#f1e9e1] pt-3"><input value={spaceName} onChange={(event) => setSpaceName(event.target.value)} placeholder="Space name" maxLength={60} className="w-full rounded-xl border border-[#e6d9cc] px-3 py-2.5 text-sm outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><textarea value={spaceDescription} onChange={(event) => setSpaceDescription(event.target.value)} placeholder="Short description" maxLength={180} rows={3} className="mt-2 w-full resize-none rounded-xl border border-[#e6d9cc] px-3 py-2.5 text-xs leading-5 outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><button disabled={!spaceName.trim() || saving} type="submit" className="mt-2 w-full rounded-xl bg-[#6f5138] px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40">Create space</button></form>}
            </div>
            <div className="rounded-2xl border border-[#eadfd3] bg-[#fffaf2] p-4"><div className="flex items-center gap-2 text-[#a66d2c]"><Bell className="h-4 w-4" /><span className="text-xs font-extrabold uppercase tracking-[0.14em]">Good to know</span></div><p className="mt-3 text-xs leading-5 text-[#887768]">Announcements stay at the top of your feed. Pin any post when you want members to see it first.</p></div>
          </aside>

          <main className="min-w-0 space-y-5">
            {showComposer && <form onSubmit={createPost} className="rounded-2xl border border-[#e6d4bd] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.06)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-extrabold text-[#4d3929]">Create a post</p><p className="mt-1 text-xs text-[#9d8b7a]">Share an update, prompt, or helpful resource.</p></div><button type="button" onClick={() => setShowComposer(false)} className="rounded-lg p-2 text-[#ad9b8b] hover:bg-[#faf5ef]"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]"><input value={postTitle} onChange={(event) => setPostTitle(event.target.value)} placeholder="Post title" maxLength={120} className="rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm font-semibold outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><select value={postSpaceId} onChange={(event) => setPostSpaceId(event.target.value)} className="rounded-xl border border-[#e6d9cc] bg-white px-3.5 py-3 text-sm text-[#6b5c50] outline-none focus:border-[#bd8956]">{spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}</select></div><textarea value={postContent} onChange={(event) => setPostContent(event.target.value)} placeholder="What would you like to share?" maxLength={10000} rows={5} className="mt-3 w-full resize-y rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /><div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-[#7e6b5b]"><input type="checkbox" checked={isAnnouncement} onChange={(event) => setIsAnnouncement(event.target.checked)} className="h-4 w-4 accent-[#6f5138]" /> Mark as announcement</label><button disabled={!postTitle.trim() || !postContent.trim() || !postSpaceId || saving} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f5138] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-3.5 w-3.5" /> Publish post</button></div></form>}

            <div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-[#4d3929]">{selectedSpaceId === "all" ? "Latest conversation" : spaces.find((space) => space.id === selectedSpaceId)?.name}</h2><p className="mt-1 text-xs text-[#9d8b7a]">{visiblePosts.length ? `${visiblePosts.length} ${visiblePosts.length === 1 ? "post" : "posts"}` : "No posts here yet"}</p></div><div className="hidden items-center gap-2 text-xs font-semibold text-[#a18e7e] sm:flex"><Users className="h-4 w-4" /> Your private teaching community</div></div>
            {visiblePosts.length === 0 && <div className="rounded-2xl border border-dashed border-[#dcc9b8] bg-white px-6 py-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbf0e3] text-[#b47e4b]"><MessagesSquare className="h-7 w-7" /></div><h3 className="mt-5 text-lg font-extrabold text-[#4d3929]">Start the conversation</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9d8b7a]">Create your first post to welcome members or share what is happening in your community.</p><button type="button" onClick={() => setShowComposer(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6f5138] px-4 py-2.5 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Create first post</button></div>}
            {visiblePosts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUserId} onUpdate={updatePost} onDelete={deletePost} onComment={addComment} />)}
          </main>

          <aside className="hidden space-y-4 lg:block">
            <div className="rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.04)]"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf0e3] text-[#a66d2c]"><Megaphone className="h-4 w-4" /></div><div><p className="text-sm font-extrabold text-[#4d3929]">Community rhythm</p><p className="text-[11px] text-[#a18e7e]">Keep members engaged</p></div></div><div className="mt-5 space-y-3 text-xs text-[#786858]"><div className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6b8f71]" /><span>Welcome new members with a pinned post.</span></div><div className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6b8f71]" /><span>Use announcements for important updates.</span></div><div className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6b8f71]" /><span>Keep questions organized in one space.</span></div></div></div>
            <div className="rounded-2xl border border-[#eadfd3] bg-[#f4f8f5] p-5"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#66816b]">Pinned posts</p>{posts.filter((post) => post.isPinned).slice(0, 3).map((post) => <button key={post.id} type="button" onClick={() => { setSelectedSpaceId(post.spaceId); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-3 block w-full text-left"><p className="line-clamp-2 text-sm font-bold text-[#4b6851]">{post.title}</p><p className="mt-1 text-[11px] text-[#7d9981]">{post.space?.name || "Community"}</p></button>)}{posts.filter((post) => post.isPinned).length === 0 && <p className="mt-3 text-xs leading-5 text-[#7d9981]">Pin an important post and it will appear here.</p>}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
