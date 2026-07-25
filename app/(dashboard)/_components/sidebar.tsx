"use client";

import { useState } from "react";
import Image from "next/image";
import { SidebarRoutes } from "./sidebar-routes";

// Used inside the mobile Sheet — always expanded, no hover logic
export const SidebarStatic = () => (
  <div className="h-full flex flex-col bg-[#FBF6EE] w-56 overflow-y-auto">
    <div className="h-[80px] flex items-center px-4 flex-shrink-0">
      <Image src="/logo.svg" alt="logo" width={120} height={30} className="object-contain" />
    </div>
    <div className="flex flex-col w-full flex-1 pt-2">
      <SidebarRoutes collapsed={false} />
    </div>
  </div>
);

// Desktop collapsible sidebar
export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`
        h-full flex flex-col bg-[#FBF6EE] shadow-sm border-r border-gray-200
        transition-[width] duration-300 ease-in-out overflow-hidden
        ${expanded ? "w-56" : "w-16"}
      `}
    >
      {/* Logo area */}
      <div className="h-[80px] flex items-center flex-shrink-0 px-3 overflow-hidden">
        {expanded ? (
          <Image src="/logo.svg" alt="logo" width={130} height={32} className="object-contain" />
        ) : (
          <div className="flex items-center justify-center w-full">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd" clipRule="evenodd"
                d="M20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40ZM23.087 15.453C24.792 13.748 24.792 10.984 23.087 9.279C21.382 7.574 18.618 7.574 16.913 9.279C15.208 10.984 15.208 13.748 16.913 15.453L20 18.54L23.087 15.453ZM24.547 23.087C26.252 24.792 29.016 24.792 30.721 23.087C32.426 21.382 32.426 18.618 30.721 16.913C29.016 15.208 26.252 15.208 24.547 16.913L21.46 20L24.547 23.087ZM23.087 30.721C24.792 29.016 24.792 26.252 23.087 24.547L20 21.46L16.913 24.547C15.208 26.252 15.208 29.016 16.913 30.721C18.618 32.426 21.382 32.426 23.087 30.721ZM9.279 23.087C7.574 21.382 7.574 18.618 9.279 16.913C10.984 15.208 13.748 15.208 15.453 16.913L18.54 20L15.453 23.087C13.748 24.792 10.984 24.792 9.279 23.087Z"
                fill="#7F57F1"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Nav routes */}
      <div className="flex flex-col w-full flex-1 pt-2">
        <SidebarRoutes collapsed={!expanded} />
      </div>
    </div>
  );
};
