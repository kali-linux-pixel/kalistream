"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-4xl opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 mb-4 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
