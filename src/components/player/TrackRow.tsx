"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { toPlayerTrack, type PlayerTrack } from "@/lib/player-track";
import { usePlayer } from "./PlayerProvider";

export function TrackRow({
  track,
  index,
  queue,
}: {
  track: PlayerTrack & { energy?: number };
  index: number;
  queue: PlayerTrack[];
}) {
  const { playTracks, current, playing } = usePlayer();
  const active = current?.id === track.id;
  return (
    <div
      className="row-hover grid grid-cols-[16px_1fr_auto] items-center gap-3 rounded-md px-3 py-2 md:grid-cols-[16px_minmax(0,2fr)_minmax(0,1fr)_80px]"
      onDoubleClick={() => playTracks(queue.map(toPlayerTrack), track.id)}
    >
      <button
        type="button"
        className="text-sm text-[#b3b3b3]"
        onClick={() => playTracks(queue.map(toPlayerTrack), track.id)}
      >
        {active && playing ? <span className="text-[#1ed760]">●</span> : <span className="group-hover:hidden">{index + 1}</span>}
      </button>
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.coverUrl} alt="" className="h-10 w-10 rounded object-cover" />
        <div className="min-w-0">
          <Link href={`/track/${track.id}`} className={`truncate text-sm hover:underline ${active ? "text-[#1ed760]" : ""}`}>
            {track.title}
          </Link>
          <p className="truncate text-xs text-[#b3b3b3]">{track.artistName}</p>
        </div>
      </div>
      <p className="hidden truncate text-sm text-[#b3b3b3] md:block">{track.collectionName}</p>
      <div className="flex items-center justify-end gap-3 text-sm text-[#b3b3b3]">
        <button
          type="button"
          className="play-fab rounded-full bg-[#1ed760] p-1.5 text-black"
          onClick={() => playTracks(queue.map(toPlayerTrack), track.id)}
          aria-label="Çal"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </button>
        {formatDuration(track.durationSec)}
      </div>
    </div>
  );
}

export function PlaylistCard({
  id,
  title,
  description,
  coverUrl,
  tracks,
}: {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tracks: PlayerTrack[];
}) {
  const { playTracks } = usePlayer();
  return (
    <div className="card-hover group relative rounded-lg bg-[#181818] p-3">
      <Link href={`/playlist/${id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt="" className="mb-3 aspect-square w-full rounded-md object-cover shadow-lg" />
        <h3 className="truncate font-semibold">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#b3b3b3]">{description}</p>
      </Link>
      <button
        type="button"
        className="play-fab absolute right-5 top-[42%] flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg"
        onClick={() => playTracks(tracks.map(toPlayerTrack))}
        aria-label={`${title} listesini çal`}
      >
        <Play className="h-5 w-5 fill-current" />
      </button>
    </div>
  );
}

export function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {href ? (
          <Link href={href} className="text-sm font-semibold text-[#b3b3b3] hover:underline">
            Tümünü göster
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
