"use client";

import { X } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { usePlayer } from "./PlayerProvider";

export function QueuePanel() {
  const { queue, index, jumpTo, queueOpen, setQueueOpen, mode, station, current } = usePlayer();
  if (!queueOpen) return null;
  return (
    <aside className="fixed right-0 top-0 z-40 flex h-[calc(100dvh-92px)] w-[min(100%,320px)] flex-col border-l border-white/5 bg-[#121212] md:static md:h-auto md:w-[320px]">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{mode === "radio" ? "Radyo kuyruğu" : "Sıradaki"}</p>
          {station ? <p className="text-xs text-[#c8a45a]">{station.name}</p> : null}
        </div>
        <button type="button" onClick={() => setQueueOpen(false)} aria-label="Kapat">
          <X className="h-4 w-4 text-[#b3b3b3]" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {queue.map((t, i) => (
          <button
            key={`${t.id}-${i}`}
            type="button"
            onClick={() => jumpTo(i)}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left ${i === index ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.coverUrl} alt="" className="h-10 w-10 rounded object-cover" />
            <span className="min-w-0 flex-1">
              <span className={`block truncate text-sm ${i === index ? "text-[#1ed760]" : ""}`}>{t.title}</span>
              <span className="block truncate text-xs text-[#b3b3b3]">{t.artistName}</span>
            </span>
            <span className="text-xs text-[#6a6a6a]">{formatDuration(t.durationSec)}</span>
          </button>
        ))}
        {!queue.length ? <p className="px-2 text-sm text-[#6a6a6a]">Kuyruk boş.</p> : null}
      </div>
      {current?.videoUrl ? (
        <p className="px-4 pb-3 text-[11px] text-[#6a6a6a]">Videolu parça — kapaktan genişlet veya TV ekranı.</p>
      ) : null}
    </aside>
  );
}
