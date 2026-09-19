"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { BarChart, BookOpen, Compass, GraduationCap, Layout, List, MessagesSquare, Video, type LucideIcon } from "lucide-react";
import { SidebarItems } from "./sidebar-items";
import { usePathname } from "next/navigation";
import { isTeacher } from "@/lib/teacher";

const LearningRoutes = [
  { icon: Layout,  label: "Dashboard", href: "/" },
  { icon: Compass, label: "Search",    href: "/search" },
  { icon: MessagesSquare, label: "Community", href: "/community" },
];

const StudioRoutes = [
  { icon: List,     label: "Courses",   href: "/teacher/courses" },
  { icon: BarChart, label: "Analytics", href: "/teacher/analytics" },
  { icon: MessagesSquare, label: "Community", href: "/teacher/community" },
  { icon: Video,    label: "ShortMeet", href: "/teacher/meet" },
];

const WorkspaceLink = ({
  collapsed,
  href,
  icon: Icon,
  label,
  active,
  onNavigate,
}: {
  collapsed: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) => (
  <Link
    href={href}
    onClick={onNavigate}
    aria-current={active ? "page" : undefined}
    title={collapsed ? label : undefined}
    className={`group flex min-h-11 items-center rounded-xl border px-2.5 transition-colors ${
      collapsed ? "justify-center" : "gap-2.5"
    } ${active ? "border-[#ead7c1] bg-white text-[#62452e] shadow-sm" : "border-transparent text-[#887768] hover:bg-white/80 hover:text-[#4d3929]"}`}
  >
    <Icon className="h-3.5 w-3.5 shrink-0" />
    {!collapsed && <span className="truncate text-xs font-bold">{label}</span>}
  </Link>
);

export const SidebarRoutes = ({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const canTeach = isTeacher(userId) || pathname?.startsWith("/teacher");
  const isTeacherPage = pathname?.startsWith("/teacher");
  const routes = isTeacherPage ? StudioRoutes : LearningRoutes;
  const modeTarget = isTeacherPage ? "/" : "/teacher/courses";
  const modeTargetLabel = isTeacherPage ? "Back to Learning" : "Open Studio";

  return (
    <div className="flex w-full flex-col gap-4">
      {canTeach && (
        <div className={collapsed ? "flex flex-col gap-1 px-2" : "px-3"}>
          {!collapsed && <p className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a17b59]">Mode</p>}
          <WorkspaceLink collapsed={collapsed} href={modeTarget} icon={isTeacherPage ? GraduationCap : BookOpen} label={modeTargetLabel} active={false} onNavigate={onNavigate} />
        </div>
      )}

      <div className="flex w-full flex-col gap-5">
        <section>
          {!collapsed && <p className="mb-2 px-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a17b59]">{isTeacherPage ? "Teaching studio" : "Learning workspace"}</p>}
          <div className="flex w-full flex-col gap-1">
            {routes.map((route) => (
              <SidebarItems key={route.href} icon={route.icon} label={route.label} href={route.href} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
