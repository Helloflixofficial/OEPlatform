import { Menu } from "lucide-react";
import { SidebarStatic } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Mobilesidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition" aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-56 border-r-0">
        <SidebarStatic />
      </SheetContent>
    </Sheet>
  );
};
