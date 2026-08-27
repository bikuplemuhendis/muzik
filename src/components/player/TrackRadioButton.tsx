"use client";

import { Radio } from "lucide-react";
import { usePlayer, type PlayerTrack } from "./PlayerProvider";

export function TrackRadioButton({ track }: { track: PlayerTrack }) {
  const { startTrackRadio } = usePlayer();
  return (
    <button
      type="button"
      onClick={() => void startTrackRadio(track)}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold"
    >
      <Radio className="h-5 w-5" />
      Radyo
    </button>
  );
}
