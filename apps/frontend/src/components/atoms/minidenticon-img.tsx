"use client";

import { cn } from "@/lib/utils";

const COLORS = [
  "#e63946", "#2a9d8f", "#e76f51", "#264653", "#6a4c93",
  "#1982c4", "#6a994e", "#3d405b", "#e07a5f", "#457b9d",
  "#6366f1", "#ec4899", "#14b8a6", "#d62828", "#8b5cf6",
  "#f4a261", "#2d6a4f", "#c77dff", "#0096c7", "#e9c46a",
];

function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitial(username: string): string {
  return username.trim().charAt(0).toUpperCase();
}

interface MinidenticonImgProps {
  username: string;
  saturation?: number;
  lightness?: number;
  className?: string;
}

const MinidenticonImg = ({ username, className }: MinidenticonImgProps) => {
  const bg = colorFromString(username);
  const letter = getInitial(username);

  return (
    <div
      className={cn("flex h-full w-full items-center justify-center", className)}
      style={{ backgroundColor: bg }}
    >
      <span
        className="select-none font-bold text-white"
        style={{ fontSize: "clamp(0.75rem, 35%, 2.5rem)" }}
      >
        {letter}
      </span>
    </div>
  );
};

export default MinidenticonImg;
