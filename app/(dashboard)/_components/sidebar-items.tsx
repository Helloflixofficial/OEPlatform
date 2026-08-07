"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative mx-2 flex h-14 w-[calc(100%-1rem)] items-center rounded-2xl border transition-all duration-200",
        collapsed ? "justify-center" : "gap-x-3 px-3",
        isActive
          ? "border-[#ead7c1] bg-[linear-gradient(135deg,#fffdf9_0%,#f8efe4_100%)] text-[#62452e] shadow-[0_8px_20px_rgba(151,111,69,0.13)]"
          : "border-transparent text-[#6f645a] hover:-translate-y-0.5 hover:bg-white/90 hover:text-[#4d3929] hover:shadow-[0_6px_16px_rgba(151,111,69,0.08)]"
      )}
    >
      {isActive && <span className="absolute -left-2 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-[#bd8956] shadow-[0_0_12px_rgba(189,137,86,0.45)]" />}

      <span className={cn(
        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
        isActive ? "border-[#efd8bb] bg-[#fffaf3] text-[#a87343] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]" : "border-[#eee3d6] bg-white/70 text-[#887768] group-hover:border-[#ead7c1] group-hover:bg-[#FBF6EE] group-hover:text-[#a87343]"
      )}>
        <Icon size={18} strokeWidth={isActive ? 2.3 : 2} className="transition-transform duration-200 group-hover:scale-105" />
      </span>

      {/* Label — only rendered (not just hidden) when not collapsed to avoid layout issues */}
      {!collapsed && (
        <span className={cn(
          "truncate text-[13px] font-semibold tracking-[0.01em] transition-colors",
          isActive ? "font-extrabold text-[#62452e]" : "text-[#6f645a] group-hover:text-[#4d3929]"
        )}>
          {label}
        </span>
      )}

      {!collapsed && isActive && <span className="ml-auto h-2 w-2 rounded-full bg-[#bd8956] shadow-[0_0_0_3px_rgba(189,137,86,0.12)]" />}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="rounded-xl border border-[#806044] bg-[#6f5138] px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-[0_8px_18px_rgba(77,57,41,0.2)]">
            {label}
          </div>
        </div>
      )}
    </Link>
  );
};
