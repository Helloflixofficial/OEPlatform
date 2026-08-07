"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Check, MessageCircle, Save, ShieldCheck, Users } from "lucide-react";

type Settings = {
  communityName: string;
  tagline: string;
  welcomeMessage: string;
  allowStudentPosts: boolean;
  allowStudentComments: boolean;
  requirePostApproval: boolean;
  showMemberCount: boolean;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange(value: boolean): void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#6f5138]" : "bg-[#d9cec2]"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

export function CommunitySettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/community/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save settings");
      setSettings((current) => ({ ...current, ...data }));
      toast.success("Community settings saved");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf8f4] px-4 pb-12 pt-6 text-[#4d3929] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/teacher/community" className="inline-flex items-center gap-2 text-sm font-bold text-[#80644d] transition hover:text-[#5d422e]"><ArrowLeft className="h-4 w-4" /> Back to community</Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-[#ead7c1] bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6b43]"><ShieldCheck className="h-3.5 w-3.5" /> Admin controls</div><h1 className="mt-3 text-3xl font-black tracking-tight text-[#3f3024]">Community settings</h1><p className="mt-2 text-sm leading-6 text-[#887768]">Shape the student experience and decide what needs your approval.</p></div>
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f5138] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(111,81,56,0.18)] transition hover:bg-[#5d422e] disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</button>
        </div>

        <section className="mt-8 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.05)] sm:p-7">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf3e8] text-[#9b6b43]"><MessageCircle className="h-5 w-5" /></div><div><h2 className="text-lg font-extrabold text-[#3f3024]">Identity and welcome</h2><p className="text-xs text-[#9d8b7a]">These details are shown to students in the community.</p></div></div>
          <div className="mt-6 grid gap-5">
            <label className="block"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#806b59]">Community name</span><input value={settings.communityName} onChange={(event) => update("communityName", event.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /></label>
            <label className="block"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#806b59]">Tagline</span><input value={settings.tagline} onChange={(event) => update("tagline", event.target.value)} maxLength={160} className="mt-2 w-full rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /></label>
            <label className="block"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#806b59]">Welcome message</span><textarea value={settings.welcomeMessage} onChange={(event) => update("welcomeMessage", event.target.value)} maxLength={600} rows={4} placeholder="Welcome your students and tell them how to use this space..." className="mt-2 w-full resize-y rounded-xl border border-[#e6d9cc] px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-[#b5a699] focus:border-[#bd8956]" /></label>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.05)] sm:p-7">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f8] text-[#6a82a8]"><Users className="h-5 w-5" /></div><div><h2 className="text-lg font-extrabold text-[#3f3024]">Member permissions</h2><p className="text-xs text-[#9d8b7a]">Students only get the actions enabled here.</p></div></div>
          <div className="mt-6 divide-y divide-[#f1e9e1]">
            {[
              { key: "allowStudentPosts" as const, title: "Allow student posts", description: "Students can publish new discussions in your spaces." },
              { key: "allowStudentComments" as const, title: "Allow student comments", description: "Students can reply to approved posts." },
              { key: "requirePostApproval" as const, title: "Require post approval", description: "New student posts stay hidden until you approve them." },
              { key: "showMemberCount" as const, title: "Show member count", description: "Display community activity statistics in the student view." },
            ].map((item) => <div key={item.key} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"><div><p className="text-sm font-extrabold text-[#4d3929]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#9d8b7a]">{item.description}</p></div><Toggle checked={settings[item.key]} onChange={(value) => update(item.key, value)} /></div>)}
          </div>
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#fbf8f4] p-3 text-xs leading-5 text-[#8d7967]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6b8f71]" /> Teachers always retain full moderation access, including approving, pinning, announcing, and deleting posts.</div>
        </section>
      </div>
    </div>
  );
}
