"use client";
import { usePathname, useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemsProps {
  icon: LucideIcon;
  label: string;
  href: string;
  collapsed?: boolean;
}

export const SidebarItems = ({ icon: Icon, label, href, collapsed = false }: SidebarItemsProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  return (
    <button
      onClick={() => router.push(href)}
      type="button"
      title={collapsed ? label : undefined}
      className={cn(
        "relative w-full flex items-center transition-all duration-200 group",
        "hover:bg-slate-200/40",
        collapsed ? "justify-center h-12" : "gap-x-3 pl-5 pr-3 h-12",
        isActive && "bg-sky-50 hover:bg-sky-100/60 text-sky-700"
      )}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-sky-600 rounded-r-full" />
      )}

      {/* Icon */}
      <Icon
        size={20}
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive ? "text-sky-600" : "text-slate-500 group-hover:text-slate-700"
        )}
      />

      {/* Label — only rendered (not just hidden) when not collapsed to avoid layout issues */}
      {!collapsed && (
        <span className={cn(
          "text-sm font-medium truncate transition-colors",
          isActive ? "text-sky-700" : "text-slate-600 group-hover:text-slate-800"
        )}>
          {label}
        </span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {label}
          </div>
        </div>
      )}
    </button>
  );
};
