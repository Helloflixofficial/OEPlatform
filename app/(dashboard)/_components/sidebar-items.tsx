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
        "group relative mx-2 flex h-12 w-[calc(100%-1rem)] items-center rounded-2xl transition-all duration-200",
        collapsed ? "justify-center" : "gap-x-3 px-3",
        isActive
          ? "bg-gradient-to-r from-[#7357ee] to-[#6048d9] text-white shadow-[0_8px_18px_rgba(105,79,224,0.2)]"
          : "text-slate-600 hover:bg-white/85 hover:text-slate-900 hover:shadow-sm"
      )}
    >
      {isActive && <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-violet-500" />}

      <span className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all",
        isActive ? "bg-white/15 text-white" : "bg-slate-100/80 text-slate-500 group-hover:bg-violet-50 group-hover:text-violet-600"
      )}>
        <Icon size={18} className="transition-colors" />
      </span>

      {/* Label — only rendered (not just hidden) when not collapsed to avoid layout issues */}
      {!collapsed && (
        <span className={cn(
          "truncate text-[13px] font-semibold transition-colors",
          isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
        )}>
          {label}
        </span>
      )}

      {!collapsed && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg">
            {label}
          </div>
        </div>
      )}
    </button>
  );
};
