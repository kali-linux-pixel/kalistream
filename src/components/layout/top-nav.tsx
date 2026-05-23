"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Film, LogOut, Shield, Sparkles, UserCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthSession } from "./auth-provider";
import { logout } from "@/firebase/auth";

export function TopNav() {
  const plan = useAppStore((s) => s.plan);
  const { user } = useAuthSession();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-cyan-400/20 bg-[#05070d]/80 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2 text-cyan-300">
          <Sparkles className="h-5 w-5" />
          <span className="text-lg font-semibold tracking-wide group-hover:text-cyan-200">KaliStream</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/premium" className="rounded-md border border-cyan-300/30 px-3 py-2 hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(34,211,238,.2)]">
            Planes
          </Link>
          <Link href="/profile" className="rounded-md border border-violet-300/30 px-3 py-2 hover:bg-violet-400/10 hover:shadow-[0_0_20px_rgba(167,139,250,.2)]">
            <UserCircle2 className="h-4 w-4" />
          </Link>
          <Link href="/watch/101" className="rounded-md border border-blue-300/30 px-3 py-2 hover:bg-blue-400/10 hover:shadow-[0_0_20px_rgba(59,130,246,.2)]">
            <Film className="h-4 w-4" />
          </Link>
          <Link href="/kalicore-admin" className="rounded-md border border-fuchsia-300/30 px-3 py-2 hover:bg-fuchsia-400/10 hover:shadow-[0_0_20px_rgba(217,70,239,.2)]">
            <Shield className="h-4 w-4" />
          </Link>
          <span className="rounded-md bg-cyan-500/15 px-3 py-2 text-cyan-200 uppercase">{plan}</span>
          {user ? (
            <button onClick={() => logout()} className="rounded-md border border-rose-300/30 px-3 py-2 hover:bg-rose-400/10">
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link href="/login" className="rounded-md border border-cyan-300/30 px-3 py-2 hover:bg-cyan-400/10">
              Login
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
