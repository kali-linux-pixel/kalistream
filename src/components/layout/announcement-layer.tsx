"use client";

import { useAppStore } from "@/store/useAppStore";
import { BellRing, X } from "lucide-react";

export function AnnouncementLayer() {
  const announcement = useAppStore((s) => s.announcement);
  const clearAnnouncement = useAppStore((s) => s.clearAnnouncement);

  if (!announcement) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-[68px] z-40 border-y border-amber-300/35 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-100">
        <BellRing className="mr-2 inline h-4 w-4" />
        {announcement}
      </div>
      <div className="fixed bottom-4 right-4 z-50 glass rounded-md p-3 text-sm text-cyan-100">
        <div className="mb-2">{announcement}</div>
        <button onClick={clearAnnouncement} className="rounded-md bg-white/10 px-2 py-1 text-xs">
          <X className="mr-1 inline h-3 w-3" />
          Cerrar
        </button>
      </div>
    </>
  );
}
