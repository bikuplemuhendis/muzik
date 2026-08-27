"use client";

import { X } from "lucide-react";
import { usePlayer } from "./PlayerProvider";

export function NowPlaying() {
  const { current, expanded, setExpanded, playing } = usePlayer();
  if (!expanded || !current) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10"
        aria-label="Kapat"
      >
        <X />
      </button>
      <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
        <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg shadow-2xl">
          {current.videoUrl ? (
            <video
              key={current.videoUrl}
              src={current.videoUrl}
              poster={current.coverUrl}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
          {!playing ? <div className="absolute inset-0 bg-black/20" /> : null}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{current.title}</h2>
          <p className="text-[#b3b3b3]">{current.artistName} · {current.collectionName}</p>
        </div>
      </div>
    </div>
  );
}
