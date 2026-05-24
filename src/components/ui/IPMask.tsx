"use client";

import { maskIP } from "@/lib/formatting";

interface IPMaskProps {
  ip: string;
  showFull?: boolean;
}

export function IPMask({ ip, showFull = false }: IPMaskProps) {
  const displayIP = showFull ? ip : maskIP(ip);

  return (
    <span
      className="font-mono text-xs text-zinc-300 hover:text-zinc-100 cursor-help transition-colors"
      title={`Full IP: ${ip}`}
    >
      {displayIP}
    </span>
  );
}
