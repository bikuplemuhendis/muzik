"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type PlayerTrack } from "@/lib/player-track";

export type { PlayerTrack };
export { toPlayerTrack } from "@/lib/player-track";

export type PlayMode = "playlist" | "radio";

export type StationMeta = {
  id: string;
  name: string;
  crossfadeSec: number;
  feedId?: string;
} | null;

type Ctx = {
  queue: PlayerTrack[];
  index: number;
  current: PlayerTrack | null;
  playing: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  expanded: boolean;
  queueOpen: boolean;
  mode: PlayMode;
  station: StationMeta;
  recents: PlayerTrack[];
  favoriteIds: Set<string>;
  playTracks: (tracks: PlayerTrack[], startId?: string) => void;
  playRadio: (tracks: PlayerTrack[], station: StationMeta, startId?: string) => void;
  startStation: (stationId: string) => Promise<void>;
  startTrackRadio: (seed: PlayerTrack) => Promise<void>;
  addToQueue: (track: PlayerTrack) => void;
  playNextInQueue: (track: PlayerTrack) => void;
  jumpTo: (i: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setExpanded: (v: boolean) => void;
  setQueueOpen: (v: boolean) => void;
  toggleFavorite: (trackId: string) => Promise<void>;
};

const PlayerContext = createContext<Ctx | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function usePlayerOptional() {
  return useContext(PlayerContext);
}

const RECENTS_KEY = "aura_recents";

function loadRecents(): PlayerTrack[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]") as PlayerTrack[];
  } catch {
    return [];
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("all");
  const [expanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [mode, setMode] = useState<PlayMode>("playlist");
  const [station, setStation] = useState<StationMeta>(null);
  const [recents, setRecents] = useState<PlayerTrack[]>(() => loadRecents());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const refillLock = useRef(false);

  const current = queue[index] ?? null;
  const modeRef = useRef(mode);
  const stationRef = useRef(station);
  const queueRef = useRef(queue);
  const indexRef = useRef(index);
  useEffect(() => {
    modeRef.current = mode;
    stationRef.current = station;
    queueRef.current = queue;
    indexRef.current = index;
  }, [mode, station, queue, index]);

  useEffect(() => {
    void fetch("/api/me/favorites")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.ids)) setFavoriteIds(new Set(j.ids));
      })
      .catch(() => undefined);
  }, []);

  const remember = useCallback((track: PlayerTrack) => {
    setRecents((prev) => {
      const next = [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 20);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
    void fetch("/api/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackId: track.id,
        stationId: stationRef.current?.id ?? "",
        source: modeRef.current,
      }),
    }).catch(() => undefined);
  }, []);

  const refillRadio = useCallback(async () => {
    if (refillLock.current) return;
    const st = stationRef.current;
    const q = queueRef.current;
    if (modeRef.current !== "radio") return;
    refillLock.current = true;
    try {
      const res = await fetch("/api/radio/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: st?.id,
          excludeIds: q.map((t) => t.id),
          count: 6,
        }),
      });
      const json = await res.json();
      const extra = (json.tracks ?? []) as PlayerTrack[];
      if (extra.length) setQueue((prev) => [...prev, ...extra.filter((t) => !prev.some((p) => p.id === t.id))]);
    } finally {
      refillLock.current = false;
    }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    const onTime = () => {
      setProgress(audio.currentTime);
      if (modeRef.current === "radio" && audio.duration && audio.currentTime / audio.duration > 0.65) {
        const i = indexRef.current;
        const q = queueRef.current;
        if (i >= q.length - 2) void refillRadio();
      }
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      setIndex((i) => {
        const q = queueRef.current;
        if (modeRef.current === "radio") {
          if (i + 1 >= q.length - 1) void refillRadio();
          return Math.min(i + 1, Math.max(q.length - 1, 0));
        }
        if (shuffle && q.length > 1) {
          let n = i;
          while (n === i) n = Math.floor(Math.random() * q.length);
          return n;
        }
        if (i + 1 < q.length) return i + 1;
        return repeat === "all" ? 0 : i;
      });
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    const abs = new URL(current.audioUrl, window.location.origin).href;
    if (audio.src !== abs) {
      audio.src = current.audioUrl;
      remember(current);
    }
    audio.volume = volume;
    if (playing) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [current, playing, volume, remember]);

  const playTracks = useCallback((tracks: PlayerTrack[], startId?: string) => {
    if (!tracks.length) return;
    const i = startId ? Math.max(0, tracks.findIndex((t) => t.id === startId)) : 0;
    setMode("playlist");
    setStation(null);
    setQueue(tracks);
    setIndex(i === -1 ? 0 : i);
    setPlaying(true);
  }, []);

  const playRadio = useCallback((tracks: PlayerTrack[], nextStation: StationMeta, startId?: string) => {
    if (!tracks.length) return;
    const i = startId ? Math.max(0, tracks.findIndex((t) => t.id === startId)) : 0;
    setMode("radio");
    setStation(nextStation);
    setQueue(tracks);
    setIndex(i === -1 ? 0 : i);
    setPlaying(true);
  }, []);

  const startStation = useCallback(async (stationId: string) => {
    const res = await fetch("/api/radio/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, count: 10 }),
    });
    const json = await res.json();
    playRadio(json.tracks ?? [], json.station);
  }, [playRadio]);

  const startTrackRadio = useCallback(
    async (seed: PlayerTrack) => {
      const res = await fetch("/api/radio/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedTrackId: seed.id, excludeIds: [seed.id], count: 10 }),
      });
      const json = await res.json();
      playRadio([seed, ...(json.tracks ?? [])], {
        id: `seed:${seed.id}`,
        name: `${seed.title} radyosu`,
        crossfadeSec: 4,
      });
    },
    [playRadio],
  );

  const addToQueue = useCallback((track: PlayerTrack) => {
    setQueue((q) => (q.some((t) => t.id === track.id) ? q : [...q, track]));
    setQueueOpen(true);
  }, []);

  const playNextInQueue = useCallback((track: PlayerTrack) => {
    setQueue((q) => {
      const without = q.filter((t) => t.id !== track.id);
      const i = indexRef.current;
      return [...without.slice(0, i + 1), track, ...without.slice(i + 1)];
    });
  }, []);

  const toggle = useCallback(() => {
    if (!current) return;
    setPlaying((p) => !p);
  }, [current]);

  const next = useCallback(() => {
    if (!queue.length) return;
    if (mode === "radio" && index >= queue.length - 2) void refillRadio();
    setIndex((i) => Math.min(i + 1, queue.length - 1));
    setPlaying(true);
  }, [queue.length, mode, index, refillRadio]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => Math.max(0, i - 1));
    setPlaying(true);
  }, []);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setProgress(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const toggleFavorite = useCallback(async (trackId: string) => {
    const res = await fetch("/api/me/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });
    const json = await res.json();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (json.favorited) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      queue,
      index,
      current,
      playing,
      progress,
      duration: duration || current?.durationSec || 0,
      volume,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      mode,
      station,
      recents,
      favoriteIds,
      playTracks,
      playRadio,
      startStation,
      startTrackRadio,
      addToQueue,
      playNextInQueue,
      jumpTo: (i) => {
        setIndex(i);
        setPlaying(true);
      },
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle: () => setShuffle((s) => !s),
      cycleRepeat: () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
      setExpanded,
      setQueueOpen,
      toggleFavorite,
    }),
    [
      queue,
      index,
      current,
      playing,
      progress,
      duration,
      volume,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      mode,
      station,
      recents,
      favoriteIds,
      playTracks,
      playRadio,
      startStation,
      startTrackRadio,
      addToQueue,
      playNextInQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleFavorite,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
