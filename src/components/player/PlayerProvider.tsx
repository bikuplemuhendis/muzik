"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type PlayerTrack } from "@/lib/player-track";

export type { PlayerTrack };
export { toPlayerTrack } from "@/lib/player-track";

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
  playTracks: (tracks: PlayerTrack[], startId?: string) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setExpanded: (v: boolean) => void;
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

  const current = queue[index] ?? null;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      setIndex((i) => {
        if (shuffle && queue.length > 1) {
          let n = i;
          while (n === i) n = Math.floor(Math.random() * queue.length);
          return n;
        }
        if (i + 1 < queue.length) return i + 1;
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
    if (audio.src !== new URL(current.audioUrl, window.location.origin).href) {
      audio.src = current.audioUrl;
    }
    audio.volume = volume;
    if (playing) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [current, playing, volume]);

  const playTracks = useCallback((tracks: PlayerTrack[], startId?: string) => {
    if (!tracks.length) return;
    const i = startId ? Math.max(0, tracks.findIndex((t) => t.id === startId)) : 0;
    setQueue(tracks);
    setIndex(i === -1 ? 0 : i);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (!current) return;
    setPlaying((p) => !p);
  }, [current]);

  const next = useCallback(() => {
    if (!queue.length) return;
    setIndex((i) => (i + 1) % queue.length);
    setPlaying(true);
  }, [queue.length]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 + queue.length) % Math.max(queue.length, 1));
    setPlaying(true);
  }, [queue.length]);

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
      playTracks,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle: () => setShuffle((s) => !s),
      cycleRepeat: () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
      setExpanded,
    }),
    [queue, index, current, playing, progress, duration, volume, shuffle, repeat, expanded, playTracks, toggle, next, prev, seek, setVolume],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
