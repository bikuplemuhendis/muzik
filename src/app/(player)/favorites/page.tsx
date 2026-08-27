"use client";

import { useEffect, useState } from "react";
import { TrackRow } from "@/components/player/TrackRow";
import { toPlayerTrack, type PlayerTrack } from "@/lib/player-track";
import { usePlayer } from "@/components/player/PlayerProvider";

export default function FavoritesPage() {
  const { recents } = usePlayer();
  const [favs, setFavs] = useState<PlayerTrack[]>([]);
  useEffect(() => {
    void fetch("/api/me/favorites")
      .then((r) => r.json())
      .then((j) => setFavs(j.tracks ?? []));
  }, []);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Favoriler ve son çalınanlar</h1>
      <h2 className="mb-3 text-xl font-semibold">Favoriler</h2>
      <div className="mb-8 rounded-xl bg-black/30 p-2">
        {favs.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={favs} />
        ))}
        {!favs.length ? <p className="p-3 text-sm text-[#6a6a6a]">Kalp ile parça ekleyin.</p> : null}
      </div>
      <h2 className="mb-3 text-xl font-semibold">Bu cihazda son çalınanlar</h2>
      <div className="rounded-xl bg-black/30 p-2">
        {recents.map((t, i) => (
          <TrackRow key={t.id} track={toPlayerTrack(t)} index={i} queue={recents} />
        ))}
      </div>
    </div>
  );
}
