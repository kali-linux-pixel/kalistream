"use client";

import { getFlagEmoji, getCountryName } from "@/lib/formatting";

interface CountryFlagProps {
  countryCode: string;
  countryName?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CountryFlag({
  countryCode,
  countryName,
  showName = true,
  size = "md",
}: CountryFlagProps) {
  const emoji = getFlagEmoji(countryCode);
  const name = countryName || getCountryName(countryCode);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={sizeClasses[size]} title={name}>
        {emoji}
      </span>
      {showName && (
        <span className="text-sm text-zinc-300">
          {name}
        </span>
      )}
    </div>
  );
}
