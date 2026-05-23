"use client";

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#07090f] to-[#0a0d14] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 glass rounded-2xl border border-cyan-400/20 p-8 md:p-12 max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-amber-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Oops! Something went wrong</h1>

        <p className="mb-6 text-sm text-zinc-300">
          {error.message || "An unexpected error occurred. Our team has been notified."}
        </p>

        {error.digest && <p className="mb-4 text-xs text-zinc-500">Error ID: {error.digest}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
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
        </div>

        <p className="mt-6 text-xs text-zinc-400">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
