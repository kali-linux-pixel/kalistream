"use client";

import { useAppStore } from "@/store/useAppStore";

export function useRoleGuard() {
  const plan = useAppStore((s) => s.plan);
  return {
    isAdmin: plan === "admin",
    isPremium: plan === "basic" || plan === "plus" || plan === "ultra" || plan === "admin",
  };
}
