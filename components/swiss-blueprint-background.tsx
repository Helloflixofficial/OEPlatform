"use client";

import React from "react";

export const SwissBlueprintBackground = () => {
  const gridSize = 32; // Grid square dimension

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#d5d3e2] dark:bg-[#161520] transition-colors duration-300">
      {/* 45-Degree Angled Diagonal Grid Canvas */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Angled Grid Pattern with 45-degree rotation */}
          <pattern
            id="angled-grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            {/* Grid lines with texture feel */}
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              strokeWidth="1.2"
              className="stroke-slate-700/40 dark:stroke-slate-300/35"
            />
          </pattern>
        </defs>

        {/* Render Angled Grid Layer */}
        <rect width="100%" height="100%" fill="url(#angled-grid-pattern)" />
      </svg>

      {/* Edge Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(40, 35, 60, 0.3) 100%)",
        }}
      />
    </div>
  );
};
