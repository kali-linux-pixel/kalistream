"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Maximize, MonitorPlay, SkipForward, Subtitles, TvMinimalPlay, Upload } from "lucide-react";
import { buildEmbedUrl, getAvailableServers, getNextServer, getQualityCap, StreamServerId } from "@/services/player";
import { useAppStore } from "@/store/useAppStore";
import { useAuthSession } from "../layout/auth-provider";
import { saveWatchProgress } from "@/firebase/firestore";
import { uploadFileWithProgress } from "@/firebase/storage";

type Props = {
  contentId: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
};

type Health = "online" | "loading" | "failed";

export function PlayerFrame({ contentId, mediaType, season = 1, episode = 1 }: Props) {
  const plan = useAppStore((s) => s.plan);
  const cinematicMode = useAppStore((s) => s.cinematicMode);
  const toggleCinematicMode = useAppStore((s) => s.toggleCinematicMode);
  const autoplay = useAppStore((s) => s.autoplay);
  const autoNext = useAppStore((s) => s.autoNext);
  const setAutoplay = useAppStore((s) => s.setAutoplay);
  const setAutoNext = useAppStore((s) => s.setAutoNext);
  const subtitleSize = useAppStore((s) => s.subtitleSize);
  const subtitlePosition = useAppStore((s) => s.subtitlePosition);
  const subtitleColor = useAppStore((s) => s.subtitleColor);
  const subtitleOpacity = useAppStore((s) => s.subtitleOpacity);
  const setSubtitleStyle = useAppStore((s) => s.setSubtitleStyle);
  const setProgress = useAppStore((s) => s.setProgress);
  const { user } = useAuthSession();

  const servers = useMemo(() => getAvailableServers(plan), [plan]);
  const maxAttempts = servers.length;
  const [serverId, setServerId] = useState<StreamServerId>(servers[0].id);
  const [errorCount, setErrorCount] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [quality, setQuality] = useState(getQualityCap(plan));
  const [isLoadingFrame, setIsLoadingFrame] = useState(true);
  const [autoRotationEnabled, setAutoRotationEnabled] = useState(true);
  const [attemptedServers, setAttemptedServers] = useState<StreamServerId[]>([]);
  const [serverHealth, setServerHealth] = useState<Record<StreamServerId, Health>>({} as Record<StreamServerId, Health>);
  const [subtitleLabel, setSubtitleLabel] = useState("Sin archivo");
  const [subtitleProgress, setSubtitleProgress] = useState(0);

  const src = buildEmbedUrl(serverId, { type: mediaType, tmdbId: contentId, season, episode });

  useEffect(() => {
    setQuality(getQualityCap(plan));
  }, [plan]);

  useEffect(() => {
    let fake = 0;
    const interval = setInterval(() => {
      fake = Math.min(100, fake + 5);
      setProgress(contentId, fake);
      if (user) {
        saveWatchProgress(user.uid, { id: Number(contentId), type: mediaType, progress: fake }).catch(() => null);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [contentId, mediaType, setProgress, user]);

  function stopAutoRotation(message: string) {
    setAutoRotationEnabled(false);
    setNotice(message);
    setIsLoadingFrame(false);
  }

  function rotateToNextServer() {
    const next = getNextServer(servers, serverId);
    if (next.id === serverId) {
      stopAutoRotation("No se pudo cargar ningun servidor por ahora.");
      return;
    }
    setServerId(next.id);
  }

  function failCurrentAndMaybeRotate(reason: string) {
    setServerHealth((prev) => ({ ...prev, [serverId]: "failed" }));
    setErrorCount((v) => v + 1);
    setAttemptedServers((prev) => {
      const nextList = prev.includes(serverId) ? prev : [...prev, serverId];
      if (nextList.length >= maxAttempts) {
        stopAutoRotation("No se pudo cargar ningun servidor por ahora.");
      } else if (autoRotationEnabled) {
        setNotice(reason);
        rotateToNextServer();
      }
      return nextList;
    });
  }

  function manualSwitch(nextId: StreamServerId) {
    setAutoRotationEnabled(false);
    setNotice(`Cambio manual a ${nextId}.`);
    setServerId(nextId);
    setIsLoadingFrame(true);
    setServerHealth((prev) => ({ ...prev, [nextId]: "loading" }));
    setTimeout(() => setNotice(null), 1500);
  }

  function manualFallback() {
    const next = getNextServer(servers, serverId);
    if (next.id === serverId) {
      stopAutoRotation("No hay mas servidores disponibles.");
      return;
    }
    manualSwitch(next.id);
  }

  useEffect(() => {
    if (!src || typeof src !== "string" || !src.startsWith("https://")) {
      failCurrentAndMaybeRotate(`URL invalida en ${serverId}, rotando servidor...`);
      return;
    }
    setIsLoadingFrame(true);
    setServerHealth((prev) => ({ ...prev, [serverId]: "loading" }));
    const timer = setTimeout(() => {
      failCurrentAndMaybeRotate(`Tiempo de espera agotado en ${serverId}, rotando servidor...`);
    }, 9000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, src]);

  return (
    <div className="space-y-4">
      {notice ? (
        <div className="glass rounded-md border border-amber-300/30 px-3 py-2 text-sm text-amber-100">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {notice}
        </div>
      ) : null}

      <div className={`relative overflow-hidden rounded-lg border border-cyan-300/20 ${cinematicMode ? "fixed inset-0 z-[60] rounded-none bg-black p-4" : "glass neon-ring"}`}>
        {isLoadingFrame ? (
          <div className={`${cinematicMode ? "h-[calc(100vh-2rem)]" : "h-[62vh]"} absolute inset-x-0 top-0 z-10 grid place-items-center bg-black/50 text-sm text-cyan-100`}>
            Conectando con {serverId}...
          </div>
        ) : null}
        <iframe
          src={src}
          className={`${cinematicMode ? "h-[calc(100vh-2rem)]" : "h-[62vh]"} w-full`}
          allowFullScreen
          title="KaliStream Player"
          referrerPolicy="origin"
          onLoad={() => {
            setIsLoadingFrame(false);
            setServerHealth((prev) => ({ ...prev, [serverId]: "online" }));
          }}
        />
      </div>

      <div className="glass rounded-lg p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {servers.map((server) => {
            const health = serverHealth[server.id] || "online";
            return (
              <button
                key={server.id}
                onClick={() => manualSwitch(server.id)}
                className={`rounded-md border px-3 py-2 text-xs ${
                  server.id === serverId ? "border-cyan-300/50 bg-cyan-500/20 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"
                }`}
                title={`${server.provider} · ${server.maxQuality} · speed ${server.speedRank}`}
              >
                {server.id} · {health}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-xs text-zinc-300">
            <span className="flex items-center gap-1"><TvMinimalPlay className="h-3.5 w-3.5" /> Calidad</span>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full rounded-md bg-black/30 p-2">
              <option>480p</option>
              <option>720p</option>
              <option>1080p</option>
              <option>4K</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-zinc-300">
            <span className="flex items-center gap-1"><Subtitles className="h-3.5 w-3.5" /> Idioma subtitulos</span>
            <select className="w-full rounded-md bg-black/30 p-2">
              <option>Espanol</option>
              <option>English</option>
              <option>Portugues</option>
            </select>
          </label>
          <div className="space-y-1 text-xs text-zinc-300">
            <span className="flex items-center gap-1"><MonitorPlay className="h-3.5 w-3.5" /> Modo</span>
            <button onClick={toggleCinematicMode} className="w-full rounded-md bg-violet-500/20 p-2 text-violet-100">
              {cinematicMode ? "Salir cinematico" : "Entrar cinematico"}
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-2 text-xs text-zinc-300">
            <label className="flex items-center justify-between">
              <span>Autoplay</span>
              <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              <span>Auto next episode</span>
              <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
            </label>
            <button onClick={manualFallback} className="rounded-md bg-amber-500/20 px-3 py-2 text-amber-100">
              <SkipForward className="mr-1 inline h-3 w-3" /> Fallback manual
            </button>
          </div>
          <div className="space-y-2 text-xs text-zinc-300">
            <label className="block rounded-md border border-white/10 bg-black/30 p-2">
              Upload .vtt / .srt
              <input
                type="file"
                accept=".vtt,.srt"
                className="mt-2 w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSubtitleLabel(file.name);
                  if (!user) {
                    setNotice("Inicia sesion para guardar subtitulos en la nube.");
                    return;
                  }
                  try {
                    setSubtitleProgress(1);
                    await uploadFileWithProgress({
                      uid: user.uid,
                      file,
                      kind: "subtitle",
                      onProgress: (percent) => setSubtitleProgress(percent),
                    });
                    setNotice("Subtitulo subido correctamente.");
                    setTimeout(() => setNotice(null), 2000);
                  } catch (err) {
                    setNotice(err instanceof Error ? err.message : "No se pudo subir el subtitulo.");
                  }
                }}
              />
              <div className="mt-2 text-[11px] text-zinc-400">
                {subtitleLabel} {subtitleProgress > 0 ? `· ${subtitleProgress}%` : ""}
              </div>
            </label>
            <label className="block">
              Tamano subtitulo: {subtitleSize}px
              <input type="range" min={14} max={36} value={subtitleSize} onChange={(e) => setSubtitleStyle({ subtitleSize: Number(e.target.value) })} className="w-full" />
            </label>
            <label className="block">
              Posicion: {subtitlePosition}%
              <input type="range" min={2} max={20} value={subtitlePosition} onChange={(e) => setSubtitleStyle({ subtitlePosition: Number(e.target.value) })} className="w-full" />
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={subtitleColor} onChange={(e) => setSubtitleStyle({ subtitleColor: e.target.value })} />
              <span>Opacidad</span>
              <input type="range" min={40} max={100} value={subtitleOpacity} onChange={(e) => setSubtitleStyle({ subtitleOpacity: Number(e.target.value) })} className="w-full" />
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-400">
          Plan {plan.toUpperCase()} · Max calidad sugerida: {getQualityCap(plan)} · Fallos detectados: {errorCount}
          <span className="ml-2">· Intentos: {attemptedServers.length}/{maxAttempts}</span>
          <button className="ml-3 rounded-md bg-cyan-500/20 px-2 py-1 text-cyan-100">
            <Maximize className="mr-1 inline h-3 w-3" /> Fullscreen Enhancer
          </button>
          <span className="ml-3 inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
            <Upload className="h-3 w-3" /> Subtitles cloud-ready
          </span>
        </div>
      </div>
    </div>
  );
}
