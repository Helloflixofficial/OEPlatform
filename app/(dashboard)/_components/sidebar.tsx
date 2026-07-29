"use client";

import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { SidebarRoutes } from "./sidebar-routes";

const BrandMark = ({ expanded }: { expanded: boolean }) => (
  <div className={`flex items-center ${expanded ? "gap-3" : "justify-center"}`}>
    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#e6d4bd] bg-white shadow-[0_8px_18px_rgba(151,111,69,0.12)]">
      <span className="absolute inset-1 rounded-xl border border-[#f0e3d2]" />
      <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd" clipRule="evenodd"
          d="M23.087 15.453C24.792 13.748 24.792 10.984 23.087 9.279C21.382 7.574 18.618 7.574 16.913 9.279C15.208 10.984 15.208 13.748 16.913 15.453L20 18.54L23.087 15.453ZM24.547 23.087C26.252 24.792 29.016 24.792 30.721 23.087C32.426 21.382 32.426 18.618 30.721 16.913C29.016 15.208 26.252 15.208 24.547 16.913L21.46 20L24.547 23.087ZM23.087 30.721C24.792 29.016 24.792 26.252 23.087 24.547L20 21.46L16.913 24.547C15.208 26.252 15.208 16.913 16.913 18.618C18.618 20.323 21.382 20.323 23.087 18.618L20 15.531L23.087 12.444Z"
          fill="#b57d4b"
        />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FBF6EE] bg-emerald-500" />
    </div>
    {expanded && (
      <div className="min-w-0">
        <p className="truncate text-[15px] font-extrabold tracking-tight text-[#3d3026]">OE Platform</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a27850]">Learn better</p>
      </div>
    )}
  </div>
);

const SidebarFooter = ({ expanded }: { expanded: boolean }) => (
  <div className={`relative flex-shrink-0 p-3 ${expanded ? "" : "flex justify-center"}`}>
    {expanded ? (
      <div className="relative overflow-hidden rounded-2xl border border-[#eadbc9] bg-white/80 p-3 shadow-sm">
        <div className="absolute -right-5 -top-7 h-20 w-20 rounded-full border-[10px] border-[#f2e7d9]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBF6EE] text-[#a87546]"><Sparkles className="h-4 w-4" /></div>
          <div className="min-w-0"><p className="text-xs font-bold text-[#4b3829]">Keep exploring</p><p className="truncate text-[10px] text-[#8b7765]">Small steps, big progress.</p></div>
        </div>
      </div>
    ) : (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadbc9] bg-white text-[#a87546]" title="Keep exploring"><BookOpen className="h-4 w-4" /></div>
    )}
  </div>
);

const SidebarShell = ({ expanded }: { expanded: boolean }) => (
  <div className="relative flex h-full min-h-0 flex-col overflow-hidden border-r border-[#e8dccc] bg-[#FBF6EE] shadow-[8px_0_28px_rgba(151,111,69,0.06)]">

    <div className={`relative flex h-[80px] flex-shrink-0 items-center border-b border-[#e8dccc] ${expanded ? "px-4" : "px-3"}`}>
      <BrandMark expanded={expanded} />
    </div>

    <div className="relative min-h-0 flex-1 overflow-y-auto py-4">
      <SidebarRoutes collapsed={!expanded} />
    </div>

    <SidebarFooter expanded={expanded} />
  </div>
);

// Used inside the mobile Sheet — always expanded, no hover logic.
export const SidebarStatic = () => (
  <div className="h-full w-60"><SidebarShell expanded /></div>
);

// Desktop collapsible sidebar.
export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`sidebar-transition h-full overflow-hidden ${expanded ? "w-60" : "w-16"}`}
    >
      <SidebarShell expanded={expanded} />
    </div>
  );
};
