"use client";
import { Compass, Layout } from "lucide-react";
import { SidebarItems } from "./sidebar-items";

const RestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Search",
    href: "/search",
  },
];
export const SidebarRoutes = () => {
  const Routes = RestRoutes;
  return (
    <div className="flex flex-col w-full ">
      {Routes.map((route) => (
        <SidebarItems
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
