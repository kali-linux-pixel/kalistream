import { MediaItem } from "@/types";
import { MovieCard } from "./movie-card";

export function MovieRow({ title, items }: { title: string; items: MediaItem[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-cyan-100">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
