"use client";

import { formatDate, formatUserCount, getRoleBadgeColor } from "@/lib/formatting";
import { motion } from "motion/react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  trend,
  icon,
  className = "",
}: AnalyticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass premium-card rounded-lg p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend.isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}% desde ayer
            </p>
          )}
        </div>
        {icon && <div className="text-2xl opacity-60">{icon}</div>}
      </div>
    </motion.div>
  );
}
