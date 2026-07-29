import { NavbarRoutes } from "@/components/navbarroutes/navbar-routes";
import { Mobilesidebar } from "./mobile-sidebar";

export const Navbar = () => {
  return (
    <div className="flex h-full items-center gap-2 border-b border-[#e8dccc] bg-[#FBF6EE] px-3 shadow-[0_4px_18px_rgba(151,111,69,0.06)] sm:px-5">
      <Mobilesidebar />
      <NavbarRoutes showContext />
    </div>
  );
};
