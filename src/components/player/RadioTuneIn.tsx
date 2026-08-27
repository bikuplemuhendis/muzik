"use client";

import { Radio } from "lucide-react";
import { usePlayer } from "./PlayerProvider";

export function RadioTuneIn({ stationId }: { stationId: string }) {
  const { startStation } = usePlayer();
  return (
    <button
      type="button"
      onClick={() => void startStation(stationId)}
      className="inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-8 py-3 font-semibold text-black"
    >
      <Radio className="h-5 w-5" />
      {stationId === "auto" ? "Otomatik yayın" : "Yayına bağlan"}
    </button>
  );
}
