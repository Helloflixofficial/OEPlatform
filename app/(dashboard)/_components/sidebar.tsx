import { Logo } from "./logo";
import {SidebarRoutes} from "./sidebar-routes"
export const Sidebar = () => {
  return (
    <div className="h-full flex flex-col overflow-y-0  bg-white shadow-sm">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes/>
      </div>
    </div>
  );
};
