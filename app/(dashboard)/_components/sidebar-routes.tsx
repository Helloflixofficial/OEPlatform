"use client";
import { BarChart, Compass, Layout, List, Video } from "lucide-react";
import { SidebarItems } from "./sidebar-items";
import { usePathname } from "next/navigation";

const RestRoutes = [
  { icon: Layout,  label: "Dashboard", href: "/" },
  { icon: Compass, label: "Search",    href: "/search" },
];

const TeacherRoutes = [
  { icon: List,     label: "Courses",   href: "/teacher/courses" },
  { icon: BarChart, label: "Analytics", href: "/teacher/analytics" },
  { icon: Video,    label: "ShortMeet", href: "/teacher/meet" },
];

export const SidebarRoutes = ({ collapsed = false }: { collapsed?: boolean }) => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.startsWith("/teacher");
  const Routes = isTeacherPage ? TeacherRoutes : RestRoutes;

  return (
    <div className="flex w-full flex-col gap-5">
      {!collapsed && <p className="px-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{isTeacherPage ? "Teaching workspace" : "Learning workspace"}</p>}
      <div className="flex w-full flex-col gap-1">
        {Routes.map((route) => (
          <SidebarItems key={route.href} icon={route.icon} label={route.label} href={route.href} collapsed={collapsed} />
        ))}
      </div>
      {!collapsed && <div className="mx-5 h-px bg-slate-200" />}
    </div>
  );
};
