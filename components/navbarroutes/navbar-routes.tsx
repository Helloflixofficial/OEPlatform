"use client";
import { usePathname } from "next/navigation";
import { ArrowLeft, GraduationCap, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Searchinput } from "./search-input";
import { isTeacher } from "@/lib/teacher";
export const NavbarRoutes = ({ showContext = false }: { showContext?: boolean }) => {
  const { userId } = useAuth()

  const Pathname = usePathname();
  const isTeacherPage = Pathname?.startsWith("/teacher");
  const isPlayerPage = Pathname?.includes("/chapter");
  const isSearchPage = Pathname === "/search";
  const contextTitle = isTeacherPage ? "Teacher workspace" : isPlayerPage ? "Learning space" : "My learning";
  const contextDescription = isTeacherPage ? "Create, teach, and track" : isPlayerPage ? "Continue your course" : "Explore something new";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      {showContext && !isSearchPage && (
        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6d4bd] bg-white text-[#a87546] shadow-sm">
            {isTeacherPage ? <GraduationCap className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#3d3026]">{contextTitle}</p>
            <p className="truncate text-[11px] text-[#927b65]">{contextDescription}</p>
          </div>
        </div>
      )}

      {isSearchPage && (
        <div className="hidden min-w-0 flex-1 md:block">
          <Searchinput />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {isTeacherPage || isPlayerPage ? (
          <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e6d4bd] bg-white/80 px-3 text-sm font-semibold text-[#6f5138] shadow-sm transition hover:bg-white hover:shadow-md">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        ) : isTeacher(userId) ? (
          <Link href="/teacher/courses" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e6d4bd] bg-white/80 px-3 text-sm font-semibold text-[#6f5138] shadow-sm transition hover:bg-white hover:shadow-md">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Teacher studio</span>
          </Link>
        ) : null}
        <div className="flex h-10 items-center rounded-xl border border-[#e6d4bd] bg-white/80 px-1 shadow-sm transition hover:bg-white">
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
        </div>
      </div>
    </div>
  );
};
