"use client";

import { Circle } from "lucide-react";
import { getStatusLabel } from "@/lib/formatting";

interface StatusIndicatorProps {
  status: "online" | "offline" | "suspicious";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({
  status,
  showLabel = true,
  size = "md",
}: StatusIndicatorProps) {
  const { label, color } = getStatusLabel(status);

  const colorMap = {
    emerald: "text-emerald-400",
    slate: "text-slate-400",
    amber: "text-amber-400",
  } as Record<string, string>;

  const sizeMap = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Circle
        className={`${sizeMap[size]} ${colorMap[color]} fill-current animate-pulse`}
      />
      {showLabel && <span className="text-sm text-zinc-300">{label}</span>}
    </div>
  );
}
