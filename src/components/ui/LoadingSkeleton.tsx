"use client";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ count = 5, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded animate-shimmer"></div>
          <div className="h-3 w-3/4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded animate-shimmer"></div>
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-t border-white/10">
      <td className="px-2 py-3">
        <div className="h-8 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded animate-shimmer"></div>
      </td>
      <td className="px-2 py-3">
        <div className="h-4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded animate-shimmer"></div>
      </td>
      <td className="px-2 py-3">
        <div className="h-4 w-20 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded animate-shimmer"></div>
      </td>
      <td className="px-2 py-3">
        <div className="h-4 w-24 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded animate-shimmer"></div>
      </td>
    </tr>
  );
}
