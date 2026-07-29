import { Menu } from "lucide-react";
import { SidebarStatic } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Mobilesidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 transition hover:opacity-75 md:hidden" aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-60 border-r-0 bg-[#FBF6EE] p-0">
        <SidebarStatic />
      </SheetContent>
    </Sheet>
  );
};
