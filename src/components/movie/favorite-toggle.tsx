"use client";

import { Heart } from "lucide-react";
import { useAuthSession } from "@/components/layout/auth-provider";
import { addFavorite, removeFavorite } from "@/firebase/firestore";

export function FavoriteToggle({ mediaId }: { mediaId: number }) {
  const { user, profile } = useAuthSession();
  const selected = Boolean(profile?.favorites?.includes(mediaId));

  return (
    <button
      onClick={async () => {
        if (!user) return;
        if (selected) await removeFavorite(user.uid, mediaId);
        else await addFavorite(user.uid, mediaId);
      }}
      className={`rounded-md border px-3 py-2 text-xs ${selected ? "border-rose-300/40 bg-rose-500/20 text-rose-200" : "border-white/15 bg-black/20 text-zinc-200"}`}
    >
      <Heart className="mr-1 inline h-3.5 w-3.5" />
      {selected ? "Quitar favorito" : "Agregar favorito"}
    </button>
  );
}
