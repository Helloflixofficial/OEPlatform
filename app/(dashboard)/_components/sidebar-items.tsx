"use client";
import { usePathname, useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface SidebarItemsprops {
  icon: LucideIcon;
  label: string;
  href: string;
}
//this down code is imported from the sidebar-routes page
export const SidebarItems = ({
  icon: Icon,
  label,
  href,
}: SidebarItemsprops) => {
  const Pathname = usePathname();
  const router = useRouter();

  const isActive =
    (Pathname === "/" && href === "/") ||
    Pathname === href ||
    Pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm-font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive &&
          "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn("text-slate-500", isActive && "text-sky-700")}
        />
        {label}
      </div>
      <div
        className={cn(
          " ml-auto opacity-0 border-2 border-sky-700  h-full translate-all",
          isActive && "opacity-100"
        )}
      ></div>
    </button>
  );
};
