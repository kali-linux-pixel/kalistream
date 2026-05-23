"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchMulti } from "@/services/tmdb";
import { MediaItem } from "@/types";
import { Search } from "lucide-react";

export function SearchPanel() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MediaItem[]>([]);

  async function runSearch() {
    setLoading(true);
    try {
      const found = await searchMulti(q);
      setResults(found.slice(0, 8));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-lg p-4">
      <div className="mb-3 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? runSearch() : null)}
          placeholder="Buscar peliculas, series, actores..."
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
        <button onClick={runSearch} className="rounded-md bg-cyan-500/20 px-3 py-2 text-cyan-100">
          <Search className="h-4 w-4" />
        </button>
      </div>
      {loading ? <p className="text-sm text-zinc-400">Buscando...</p> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {results.map((item) => (
          <Link key={item.id} href={`/watch/${item.id}?type=${item.tmdbType || "movie"}`} className="rounded-md bg-black/20 p-2">
            {item.poster ? (
              <Image src={item.poster} alt={item.title} width={180} height={260} className="mb-2 h-36 w-full rounded-md object-cover" />
            ) : null}
            <p className="line-clamp-1 text-xs text-zinc-200">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
