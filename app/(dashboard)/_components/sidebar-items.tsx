"use client";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
interface SidebarItemsprops {
  icon: LucideIcon;
  label: string;
  href: string;
}
export const SidebarItems = ({
    icon : Icon,
    label,
    href}: SidebarItemsprops) => {
        const PathName = usePathname();
  return <div>sidebar items</div>;
};
