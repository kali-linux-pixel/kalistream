import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md px-3 py-2 text-sm transition",
        variant === "default" ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" : "bg-white/5 text-zinc-100 hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
