"use client";

interface UserBadgeProps {
  role: string;
  size?: "sm" | "md" | "lg";
}

export function UserBadge({ role, size = "md" }: UserBadgeProps) {
  const roleMap: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    admin: { label: "ADMIN", color: "text-red-200", bg: "bg-red-500/20" },
    owner: { label: "OWNER", color: "text-red-200", bg: "bg-red-500/20" },
    moderator: {
      label: "MODERATOR",
      color: "text-blue-200",
      bg: "bg-blue-500/20",
    },
    ultra: { label: "ULTRA", color: "text-violet-200", bg: "bg-violet-500/20" },
    plus: { label: "PLUS", color: "text-cyan-200", bg: "bg-cyan-500/20" },
    basic: {
      label: "BASIC",
      color: "text-emerald-200",
      bg: "bg-emerald-500/20",
    },
    free: { label: "FREE", color: "text-zinc-300", bg: "bg-zinc-500/20" },
  };

  const config = roleMap[role?.toLowerCase()] || roleMap.free;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span className={`${sizeClasses[size]} ${config.bg} ${config.color} rounded-full font-semibold uppercase`}>
      {config.label}
    </span>
  );
}
