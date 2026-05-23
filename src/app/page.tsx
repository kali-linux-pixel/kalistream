import { MovieRow } from "@/components/movie/movie-row";
import { SearchPanel } from "@/components/movie/search-panel";
import { MediaItem } from "@/types";
import {
  getAnime,
  getHorror,
  getPopularMovies,
  getSciFi,
  getTopRatedMovies,
  getTrending,
} from "@/services/tmdb";

import { Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  let trending: MediaItem[] = [];
  let popular: MediaItem[] = [];
  let topRated: MediaItem[] = [];
  let anime: MediaItem[] = [];
  let horror: MediaItem[] = [];
  let scifi: MediaItem[] = [];
  let dataError = false;

  try {
    const [trendingData, popularData, topRatedData, animeData, horrorData, scifiData] =
      await Promise.all([
        getTrending(),
        getPopularMovies(),
        getTopRatedMovies(),
        getAnime(),
        getHorror(),
        getSciFi(),
      ]);
    trending = trendingData;
    popular = popularData;
    topRated = topRatedData;
    anime = animeData;
    horror = horrorData;
    scifi = scifiData;
  } catch {
    dataError = true;
  }

  return (
    <div className="space-y-10">
      {dataError ? (
        <div className="rounded-lg border border-amber-300/30 bg-amber-500/5 p-4 text-sm text-amber-100">
          Some content may be temporarily unavailable. Showing cached or partial results.
        </div>
      ) : null}
      {/* HERO */}
      <section className="hero-cinematic relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/40 p-8 md:p-14">
        {/* GLOWS */}
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10">
          {/* TOP LABEL */}
          <p className="mb-4 flex items-center gap-2 text-sm text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Startup Streaming Experience
          </p>

          {/* TITLE */}
          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            STREAM THE
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              {" "}
              FUTURE
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
            Peliculas, anime y series con una experiencia cinematica cyberpunk,
            multi-servidor premium y streaming futurista.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/watch/550?type=movie"
              className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(34,211,238,.6)]"
            >
              Ver Ahora
            </Link>

            <Link
              href="/premium"
              className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-6 py-3 font-semibold text-violet-200 transition duration-300 hover:bg-violet-500/20 hover:shadow-[0_0_30px_rgba(168,85,247,.4)]"
            >
              Explorar Premium
            </Link>
          </div>

          {/* EXTRA TEXT */}
          <p className="mt-6 max-w-2xl text-zinc-400">
            Explora estrenos, anime, sci-fi y horror con una experiencia
            inmersiva y servidores por plan.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Zap,
            text: "Transiciones cinematicas",
          },
          {
            icon: Crown,
            text: "Planes Free, Basic, Plus y Ultra",
          },
          {
            icon: Sparkles,
            text: "Anuncios y panel admin en tiempo real",
          },
        ].map((item) => (
          <article
            key={item.text}
            className="glass premium-card rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-cyan-400/20"
          >
            <item.icon className="mb-3 h-6 w-6 text-cyan-300" />

            <p className="text-sm text-zinc-200">{item.text}</p>
          </article>
        ))}
      </section>

      {/* SEARCH */}
      <SearchPanel />

      {/* MOVIE ROWS */}
      <div className="space-y-10">
        <MovieRow title="Trending" items={trending} />
        <MovieRow title="Popular" items={popular} />
        <MovieRow title="Top Rated" items={topRated} />
        <MovieRow title="Anime" items={anime} />
        <MovieRow title="Sci-Fi" items={scifi} />
        <MovieRow title="Horror" items={horror} />
      </div>

      {/* PREMIUM BANNER */}
      <section className="glass premium-card rounded-2xl border border-violet-500/20 bg-gradient-to-r from-cyan-500/5 to-violet-500/10 p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
          Banner Premium
        </p>

        <h2 className="text-2xl font-bold text-white">
          Activa Ultra para 4K, descargas y estrenos recientes.
        </h2>

        <p className="mt-2 max-w-2xl text-zinc-300">
          Desbloquea calidad ultra HD, multi-servidor prioritario y acceso a
          contenido exclusivo futurista.
        </p>

        <Link
          href="/premium"
          className="mt-5 inline-flex rounded-xl bg-violet-500/20 px-5 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
        >
          Ver Premium
        </Link>
      </section>
    </div>
  );
}