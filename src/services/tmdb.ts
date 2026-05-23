import { CastMember, Genre, MediaDetails, MediaItem, Trailer } from "@/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/original";

type TmdbListItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
};

type TmdbGenreResponse = {
  genres: Genre[];
};

type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
};

type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  number_of_seasons?: number;
  videos?: { results: TmdbVideo[] };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character?: string;
      profile_path?: string;
    }>;
  };
};

async function tmdbFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_TMDB_API_KEY");
  }
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${TMDB_BASE}${path}${separator}api_key=${apiKey}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) {
    throw new Error(`TMDB fetch failed: ${path}`);
  }
  return (await res.json()) as T;
}

function asMediaItem(item: TmdbListItem, fallbackType?: "movie" | "tv"): MediaItem {
  const tmdbType = item.media_type ?? fallbackType ?? "movie";
  return {
    id: item.id,
    title: item.title || item.name || "Untitled",
    overview: item.overview || "No overview available.",
    poster: item.poster_path ? `${TMDB_IMAGE}${item.poster_path}` : "",
    backdrop: item.backdrop_path ? `${TMDB_BACKDROP}${item.backdrop_path}` : "",
    rating: Number(item.vote_average?.toFixed?.(1) ?? 0),
    year: Number((item.release_date || item.first_air_date || "2025").slice(0, 4)),
    tags: [],
    kind: tmdbType === "tv" ? "series" : "movie",
    tmdbType,
  };
}

async function getList(path: string, fallbackType?: "movie" | "tv"): Promise<MediaItem[]> {
  try {
    const data = await tmdbFetch<{ results: TmdbListItem[] }>(path);
    return (data.results ?? []).slice(0, 18).map((m) => asMediaItem(m, fallbackType));
  } catch {
    return [];
  }
}

export async function getTrending() {
  return getList("/trending/all/week");
}

export async function getPopularMovies() {
  return getList("/movie/popular", "movie");
}

export async function getTopRatedMovies() {
  return getList("/movie/top_rated", "movie");
}

export async function getAnime() {
  return getList("/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc", "tv");
}

export async function getHorror() {
  return getList("/discover/movie?with_genres=27&sort_by=popularity.desc", "movie");
}

export async function getSciFi() {
  return getList("/discover/movie?with_genres=878&sort_by=popularity.desc", "movie");
}

export async function searchMulti(query: string) {
  if (!query.trim()) return [];
  return getList(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);
}

export async function getGenres(type: "movie" | "tv") {
  try {
    const data = await tmdbFetch<TmdbGenreResponse>(`/genre/${type}/list`);
    return data.genres;
  } catch {
    return [];
  }
}

export async function getDetails(id: string | number, type: "movie" | "tv" = "movie"): Promise<MediaDetails> {
  const data = await tmdbFetch<TmdbDetails>(`/${type}/${id}?append_to_response=videos,credits`);
  const trailers: Trailer[] = (data.videos?.results ?? [])
    .filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    .slice(0, 5)
    .map((v) => ({ id: v.id, key: v.key, name: v.name, site: v.site, type: v.type }));

  const cast: CastMember[] = (data.credits?.cast ?? []).slice(0, 12).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character || "N/A",
    profile: c.profile_path ? `${TMDB_IMAGE}${c.profile_path}` : null,
  }));

  return {
    id: data.id,
    title: data.title || data.name || "Untitled",
    overview: data.overview || "No overview available.",
    poster: data.poster_path ? `${TMDB_IMAGE}${data.poster_path}` : "",
    backdrop: data.backdrop_path ? `${TMDB_BACKDROP}${data.backdrop_path}` : "",
    rating: Number(data.vote_average?.toFixed?.(1) ?? 0),
    releaseDate: data.release_date || data.first_air_date || "",
    runtime: data.runtime || data.episode_run_time?.[0] || 0,
    genres: data.genres || [],
    type,
    seasons: data.number_of_seasons,
    trailers,
    cast,
  };
}

export async function getRecommendations(id: string | number, type: "movie" | "tv" = "movie") {
  return getList(`/${type}/${id}/recommendations`, type);
}
