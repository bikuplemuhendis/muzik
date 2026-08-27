"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlaylistCard, TrackRow } from "@/components/player/TrackRow";
import { toPlayerTrack, type PlayerTrack } from "@/lib/player-track";

type Result = {
  tracks: (PlayerTrack & { collectionName: string })[];
  playlists: { id: string; title: string; description: string; coverUrl: string }[];
  terms: { kind: string; slug: string; nameTr: string }[];
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Result | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then(setData);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const tracks = (data?.tracks ?? []).map(toPlayerTrack);

  return (
    <div>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Parça, mekân, ruh hali veya liste ara"
        className="mb-8 w-full max-w-xl rounded-full px-5 py-3 text-base"
      />
      {!q ? (
        <p className="text-[#b3b3b3]">Kafe, spa, lobi, lo-fi, akşam…</p>
      ) : (
        <>
          {data?.terms?.length ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {data.terms.map((t) => (
                <Link
                  key={`${t.kind}-${t.slug}`}
                  href={`/browse/${t.kind.toLowerCase()}/${t.slug}`}
                  className="rounded-full bg-[#282828] px-3 py-1 text-sm"
                >
                  {t.nameTr}
                </Link>
              ))}
            </div>
          ) : null}
          {data?.playlists?.length ? (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.playlists.map((pl) => (
                <PlaylistCard key={pl.id} id={pl.id} title={pl.title} description={pl.description} coverUrl={pl.coverUrl} tracks={tracks} />
              ))}
            </div>
          ) : null}
          <div className="rounded-xl bg-black/30 p-2">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} queue={tracks} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
