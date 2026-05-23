import Image from "next/image";
import Link from "next/link";
import { PlayerFrame } from "@/components/player/player-frame";
import { getDetails, getRecommendations } from "@/services/tmdb";
import { CalendarDays, Clock3, Star } from "lucide-react";
import { FavoriteToggle } from "@/components/movie/favorite-toggle";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: "movie" | "tv"; season?: string; episode?: string }>;
};

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const type = query.type === "tv" ? "tv" : "movie";
  const season = Number(query.season || 1);
  const episode = Number(query.episode || 1);

  let details;
  let recommendations = [];

  try {
    [details, recommendations] = await Promise.all([
      getDetails(id, type),
      getRecommendations(id, type),
    ]);
  } catch (error) {
    throw error;
  }

  if (!details || details.title === "Content Unavailable") {
    throw new Error("Content not found");
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg border border-cyan-400/20">
        {details.backdrop ? (
          <Image src={details.backdrop} alt={details.title} width={1600} height={900} className="h-64 w-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] to-transparent" />
        <div className="absolute bottom-0 flex w-full gap-4 p-5">
          {details.poster ? <Image src={details.poster} alt={details.title} width={120} height={180} className="rounded-md border border-white/20" /> : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">{details.title}</h1>
            <p className="max-w-3xl text-sm text-zinc-200">{details.overview}</p>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-300">
              <span><Star className="mr-1 inline h-3 w-3 text-amber-300" /> {details.rating}</span>
              <span><Clock3 className="mr-1 inline h-3 w-3" /> {details.runtime || 0} min</span>
              <span><CalendarDays className="mr-1 inline h-3 w-3" /> {details.releaseDate || "N/A"}</span>
              {details.genres.slice(0, 3).map((genre) => (
                <span key={genre.id} className="rounded bg-white/10 px-2 py-1">{genre.name}</span>
              ))}
              <FavoriteToggle mediaId={details.id} />
            </div>
          </div>
        </div>
      </section>

      <PlayerFrame contentId={id} mediaType={type} season={season} episode={episode} />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass rounded-lg p-4">
          <h2 className="mb-3 text-lg font-semibold text-cyan-100">Trailers</h2>
          <div className="space-y-2">
            {details.trailers.slice(0, 2).map((trailer) => (
              <iframe
                key={trailer.id}
                src={`https://www.youtube.com/embed/${trailer.key}`}
                className="h-52 w-full rounded-md"
                allowFullScreen
                title={trailer.name}
              />
            ))}
          </div>
        </article>
        <article className="glass rounded-lg p-4">
          <h2 className="mb-3 text-lg font-semibold text-cyan-100">Cast</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-200">
            {details.cast.slice(0, 8).map((actor) => (
              <p key={actor.id}>{actor.name} · <span className="text-zinc-400">{actor.character}</span></p>
            ))}
          </div>
        </article>
      </section>

      <section className="glass rounded-lg p-4">
        <h2 className="mb-3 text-lg font-semibold text-cyan-100">Recommendations</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {recommendations.slice(0, 12).map((item) => (
            <Link key={item.id} href={`/watch/${item.id}?type=${item.tmdbType || "movie"}`}>
              {item.poster ? (
                <Image src={item.poster} alt={item.title} width={240} height={360} className="h-52 w-full rounded-md object-cover" />
              ) : (
                <div className="h-52 rounded-md bg-white/5" />
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="glass rounded-lg p-4">
        <h2 className="mb-2 text-lg font-semibold text-cyan-100">Comments</h2>
        <div className="rounded-md border border-white/10 bg-black/25 p-3 text-sm text-zinc-300">
          Sistema de comentarios en roadmap (Firebase collection: comments).
        </div>
      </section>
    </div>
  );
}
