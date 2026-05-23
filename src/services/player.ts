import { PlanType } from "@/types";

export type StreamServerId =
  | "Oxygen"
  | "Helium"
  | "Hydrogen"
  | "Lithium"
  | "Nova"
  | "Titan"
  | "Quantum"
  | "Eclipse";

export type ServerHealth = "online" | "degraded" | "offline";

export type StreamServer = {
  id: StreamServerId;
  provider: string;
  maxQuality: "720p" | "1080p" | "4K";
  speedRank: number;
  health: ServerHealth;
  premium: boolean;
};

const catalogs: StreamServer[] = [
  { id: "Oxygen", provider: "VidKing", maxQuality: "1080p", speedRank: 90, health: "online", premium: false },
  { id: "Helium", provider: "RiveStream", maxQuality: "1080p", speedRank: 88, health: "online", premium: false },
  { id: "Hydrogen", provider: "IntroDB", maxQuality: "1080p", speedRank: 84, health: "online", premium: true },
  { id: "Lithium", provider: "VidSrc", maxQuality: "4K", speedRank: 92, health: "online", premium: true },
  { id: "Nova", provider: "SuperEmbed", maxQuality: "4K", speedRank: 89, health: "degraded", premium: true },
  { id: "Titan", provider: "MultiEmbed", maxQuality: "4K", speedRank: 87, health: "online", premium: true },
  { id: "Quantum", provider: "AutoEmbed", maxQuality: "1080p", speedRank: 82, health: "online", premium: true },
  { id: "Eclipse", provider: "BackupEmbed", maxQuality: "720p", speedRank: 78, health: "online", premium: true },
];

type TypeWithEpisode = {
  type: "movie" | "tv";
  tmdbId: string | number;
  season?: number;
  episode?: number;
};

function buildProviderUrls({ type, tmdbId, season = 1, episode = 1 }: TypeWithEpisode) {
  const movie = type === "movie";
  return {
    VidKing: movie
      ? `https://www.vidking.net/embed/movie/${tmdbId}`
      : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}`,
    RiveStream: movie
      ? `https://www.rivestream.app/embed?type=movie&id=${tmdbId}`
      : `https://www.rivestream.app/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`,
    IntroDB: movie
      ? `https://www.rivestream.app/embed/torrent?type=movie&id=${tmdbId}`
      : `https://www.rivestream.app/embed/agg?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`,
    VidSrc: movie ? `https://vidsrc.xyz/embed/movie/${tmdbId}` : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
    SuperEmbed: movie ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
    MultiEmbed: movie ? `https://www.2embed.cc/embed/${tmdbId}` : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
    AutoEmbed: movie ? `https://player.autoembed.cc/embed/movie/${tmdbId}` : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
    PlayerX: movie ? `https://player.videasy.net/movie/${tmdbId}` : `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
    PrimeEmbed: movie ? `https://www.primewire.tf/embed/movie/${tmdbId}` : `https://www.primewire.tf/embed/tv/${tmdbId}/${season}/${episode}`,
    BackupEmbed: movie ? `https://www.rivestream.app/embed/agg?type=movie&id=${tmdbId}` : `https://www.rivestream.app/embed/agg?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`,
  };
}

const serverProviderMap: Record<StreamServerId, keyof ReturnType<typeof buildProviderUrls>> = {
  Oxygen: "VidKing",
  Helium: "RiveStream",
  Hydrogen: "IntroDB",
  Lithium: "VidSrc",
  Nova: "SuperEmbed",
  Titan: "MultiEmbed",
  Quantum: "AutoEmbed",
  Eclipse: "BackupEmbed",
};

export function getAvailableServers(plan: PlanType): StreamServer[] {
  if (plan === "free") return catalogs.filter((s) => !s.premium && s.health !== "offline");
  if (plan === "basic") return catalogs.filter((s) => !s.premium || s.id === "Hydrogen");
  if (plan === "plus") return catalogs.filter((s) => s.id !== "Eclipse");
  return catalogs;
}

export function getQualityCap(plan: PlanType) {
  if (plan === "free") return "480p";
  if (plan === "basic") return "720p";
  if (plan === "plus") return "1080p";
  return "4K";
}

export function buildEmbedUrl(serverId: StreamServerId, payload: TypeWithEpisode) {
  const provider = serverProviderMap[serverId];
  const urls = buildProviderUrls(payload);
  const candidate = urls[provider];
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:") throw new Error("Invalid protocol");
    return candidate;
  } catch {
    return urls.BackupEmbed;
  }
}

export function getNextServer(servers: StreamServer[], currentId: StreamServerId) {
  const idx = servers.findIndex((s) => s.id === currentId);
  if (idx < 0) return servers[0];
  return servers[(idx + 1) % servers.length];
}
