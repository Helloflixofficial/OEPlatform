"use client";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { JoystickIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Searchinput } from "./search-input";
export const NavbarRoutes = () => {
  const Pathname = usePathname();
  const isTeacherPage = Pathname?.startsWith("/teacher");
  const isPlayerPage = Pathname?.includes("/chapter");
  const isSearchPage = Pathname === "/search";
  return (
    <>{isSearchPage && (
      <div className="hidden md:block">
        <Searchinput/>
      </div>
    )}
    <div className="flex gap-x-2 ml-auto">
      {isTeacherPage || isPlayerPage ? (
        <Link href="/">
          <Button variant="ghost">
            <LogOut className="h-4 w-4 mr-2" />
            Exit!
          </Button>
        </Link>
      ) : (
        <Link href="/teacher/courses">
          <Button size="sm" variant="ghost">
            <JoystickIcon className="h-4 w-4 mr-2" />
            Teacher!
          </Button>
        </Link>
      )}
      <UserButton afterSignOutUrl="/" />
    </div>
    </>
  );
};
