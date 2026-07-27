import React from "react";
import { SwissBlueprintBackground } from "@/components/swiss-blueprint-background";
import { Command } from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#faf9f6] dark:bg-[#0a0a0c] selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Subtle Background Pattern */}
      <SwissBlueprintBackground />

      {/* Transparent Topbar Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 sm:px-10 bg-transparent border-0">
        {/* Left Side Corner: Brand Logo & Text */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
            <Command className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              OE Platform
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wider uppercase font-mono">
              ENTERPRISE V2.4
            </span>
          </div>
        </div>
      </header>

      {/* Centered Auth Content */}
      <main className="relative z-10 pt-16 flex items-center justify-center min-h-screen w-full p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
