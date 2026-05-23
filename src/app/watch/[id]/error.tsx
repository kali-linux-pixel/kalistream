"use client";

import { AlertTriangle, Home, Search } from "lucide-react";
import Link from "next/link";

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07090f] to-[#0a0d14] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <section className="glass rounded-lg border border-amber-300/30 bg-amber-500/5 p-8 md:p-12">
          <div className="mb-6 flex justify-center">
            <AlertTriangle className="h-14 w-14 text-amber-400" />
          </div>

          <h1 className="mb-3 text-center text-3xl font-bold text-white">Content Not Found</h1>

          <p className="mb-2 text-center text-sm text-zinc-300">
            This content is currently unavailable or does not exist.
          </p>

          <p className="mb-6 text-center text-xs text-zinc-400">
            {error.message || "Try searching for another title or browse our collection."}
          </p>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30"
            >
              Try Again
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              <Home className="h-4 w-4" /> Home
            </Link>

            <Link
              href="/?search=true"
              className="flex items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
          </div>

          <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center text-xs text-zinc-400">
            <p className="mb-2 font-semibold">Explore instead:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/" className="rounded bg-white/10 px-2 py-1 hover:bg-white/20">
                Trending
              </Link>
              <Link href="/" className="rounded bg-white/10 px-2 py-1 hover:bg-white/20">
                Popular
              </Link>
              <Link href="/" className="rounded bg-white/10 px-2 py-1 hover:bg-white/20">
                Premium
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
