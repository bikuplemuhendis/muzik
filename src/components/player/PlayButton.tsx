"use client";

import { Play } from "lucide-react";
import { toPlayerTrack, type PlayerTrack } from "@/lib/player-track";
import { usePlayer } from "./PlayerProvider";

export function PlayButton({ tracks, startId, label = "Çal" }: { tracks: PlayerTrack[]; startId?: string; label?: string }) {
  const { playTracks } = usePlayer();
  return (
    <button
      type="button"
      onClick={() => playTracks(tracks.map(toPlayerTrack), startId)}
      className="inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-8 py-3 font-semibold text-black"
    >
      <Play className="h-5 w-5 fill-current" />
      {label}
    </button>
  );
}
