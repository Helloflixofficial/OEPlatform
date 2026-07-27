"use client";

import React, { useEffect, useState } from "react";

interface MovingBox {
  id: number;
  col: number;
  row: number;
  color: string;
  opacity: number;
}

const initialBoxes: MovingBox[] = [
  { id: 1, col: 2, row: 3, color: "#ec4899", opacity: 0.85 },   // Pink/Magenta
  { id: 2, col: 5, row: 17, color: "#10b981", opacity: 0.85 },  // Green
  { id: 3, col: 9, row: 6, color: "#3b82f6", opacity: 0.8 },    // Blue
  { id: 4, col: 13, row: 20, color: "#ec4899", opacity: 0.85 }, // Pink
  { id: 5, col: 16, row: 4, color: "#f59e0b", opacity: 0.85 },  // Amber
  { id: 6, col: 20, row: 14, color: "#10b981", opacity: 0.85 }, // Green
  { id: 7, col: 24, row: 7, color: "#8b5cf6", opacity: 0.85 },  // Violet
  { id: 8, col: 28, row: 18, color: "#f43f5e", opacity: 0.8 },  // Rose
  { id: 9, col: 32, row: 5, color: "#06b6d4", opacity: 0.85 },  // Cyan
  { id: 10, col: 7, row: 12, color: "#a855f7", opacity: 0.85 }, // Purple
  { id: 11, col: 26, row: 23, color: "#ec4899", opacity: 0.8 }, // Pink
  { id: 12, col: 35, row: 10, color: "#10b981", opacity: 0.85 },// Green
];

export const AuthGridBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [boxes, setBoxes] = useState<MovingBox[]>(initialBoxes);

  const boxSize = 28; // Size of small boxes in pixels

  useEffect(() => {
    setMounted(true);

    // Periodically shift colored boxes to new grid positions smoothly
    const interval = setInterval(() => {
      setBoxes((prevBoxes) =>
        prevBoxes.map((box) => {
          // 40% chance for a box to move on each tick
          if (Math.random() > 0.6) {
            const dCol = Math.floor(Math.random() * 5) - 2;
            const dRow = Math.floor(Math.random() * 5) - 2;

            const newCol = Math.max(1, Math.min(40, box.col + dCol));
            const newRow = Math.max(1, Math.min(28, box.row + dRow));

            return {
              ...box,
              col: newCol,
              row: newRow,
            };
          }
          return box;
        })
      );
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* SVG Grid Canvas */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="auth-small-boxes-pattern"
            width={boxSize}
            height={boxSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Solid visible grid lines */}
            <path
              d={`M ${boxSize} 0 L 0 0 0 ${boxSize}`}
              fill="none"
              strokeWidth="1"
              shapeRendering="crispEdges"
              className="stroke-slate-300 dark:stroke-slate-700"
            />
          </pattern>
        </defs>

        {/* Base Grid lines layer */}
        <rect width="100%" height="100%" fill="url(#auth-small-boxes-pattern)" />

        {/* Live Moving Small Colored Accent Boxes (Hollow / Outlined Style) */}
        {mounted &&
          boxes.map((box) => (
            <rect
              key={box.id}
              x={box.col * boxSize + 1}
              y={box.row * boxSize + 1}
              width={boxSize - 1}
              height={boxSize - 1}
              fill={`${box.color}15`}
              stroke={box.color}
              strokeWidth="1.5"
              rx="2"
              ry="2"
              className="transition-all duration-1000 ease-in-out"
              style={{
                opacity: box.opacity,
                filter: `drop-shadow(0px 0px 6px ${box.color}55)`,
              }}
            />
          ))}
      </svg>

      {/* Soft Radial Vignette Overlay for smooth edges */}
      <div 
        className="absolute inset-0 bg-slate-50/10 dark:bg-slate-950/30"
        style={{
          maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, #000 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, #000 100%)",
        }}
      />
    </div>
  );
};
