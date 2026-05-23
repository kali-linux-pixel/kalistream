import Image from "next/image";
import Link from "next/link";
import { MediaItem } from "@/types";
import { PlayCircle } from "lucide-react";

export function MovieCard({ item }: { item: MediaItem }) {
  return (
    <Link href={`/watch/${item.id}?type=${item.tmdbType || "movie"}`} className="premium-card group relative overflow-hidden rounded-lg border border-white/10">
      <Image src={item.poster} alt={item.title} width={400} height={600} className="h-72 w-full object-cover transition group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-85" />
      <div className="absolute bottom-0 p-3">
        <p className="text-sm font-medium text-white">{item.title}</p>
        <p className="text-xs text-cyan-200">{item.year} · {item.rating}</p>
      </div>
      <PlayCircle className="absolute right-3 top-3 h-6 w-6 text-cyan-200 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}
