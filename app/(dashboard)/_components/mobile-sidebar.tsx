import { Menu } from "lucide-react";
import { SidebarStatic } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Mobilesidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="mr-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6d4bd] bg-white/80 text-[#6f5138] shadow-sm transition hover:bg-white md:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-60 border-r-0 bg-[#FBF6EE] p-0">
        <SidebarStatic />
      </SheetContent>
    </Sheet>
  );
};
