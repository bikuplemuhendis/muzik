"use client";

import Link from "next/link";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { usePlayer } from "./PlayerProvider";

export function PlayerBar() {
  const {
    current,
    playing,
    progress,
    duration,
    volume,
    shuffle,
    repeat,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    setExpanded,
  } = usePlayer();

  return (
    <footer className="h-[92px] border-t border-white/5 bg-black px-3 py-2 md:px-4">
      <div className="grid h-full grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1.2fr_2fr_1fr]">
        <div className="flex min-w-0 items-center gap-3">
          {current ? (
            <>
              <button type="button" onClick={() => setExpanded(true)} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.coverUrl} alt="" className="h-14 w-14 rounded object-cover" />
              </button>
              <div className="min-w-0">
                <Link href={`/track/${current.id}`} className="block truncate text-sm font-medium hover:underline">
                  {current.title}
                </Link>
                <p className="truncate text-xs text-[#b3b3b3]">{current.artistName}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6a6a6a]">Bir parça seçin</p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShuffle}
              className={shuffle ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}
              aria-label="Karıştır"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button type="button" onClick={prev} className="text-[#b3b3b3] hover:text-white" aria-label="Önceki">
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={toggle}
              disabled={!current}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
              aria-label={playing ? "Duraklat" : "Çal"}
            >
              {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button type="button" onClick={next} className="text-[#b3b3b3] hover:text-white" aria-label="Sonraki">
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className={repeat === "off" ? "text-[#b3b3b3] hover:text-white" : "text-[#1ed760]"}
              aria-label="Tekrar"
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>
          <div className="flex w-full max-w-xl items-center gap-2 text-[11px] text-[#b3b3b3]">
            <span className="w-10 text-right">{formatDuration(progress || 0)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress || 0}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 w-full accent-[#1ed760]"
            />
            <span className="w-10">{formatDuration(duration || 0)}</span>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 md:flex">
          <Volume2 className="h-4 w-4 text-[#b3b3b3]" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-28 accent-white"
          />
        </div>
      </div>
    </footer>
  );
}
