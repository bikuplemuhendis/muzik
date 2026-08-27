"use client";

import Link from "next/link";
import { Radio, Tv } from "lucide-react";
import { usePlayer } from "./PlayerProvider";

export function LiveHero({
  station,
  venueName,
  daypartLabel,
}: {
  station: { id: string; name: string; tagline: string; coverUrl: string };
  venueName?: string;
  daypartLabel: string;
}) {
  const { startStation } = usePlayer();
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
      <div className="grid md:grid-cols-[220px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={station.coverUrl} alt="" className="h-full max-h-56 w-full object-cover" />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c8a45a]">
            Canlı öneri · {daypartLabel}
          </p>
          <h2 className="mt-2 text-3xl font-bold">{station.name}</h2>
          <p className="mt-2 max-w-xl text-[#b3b3b3]">
            {station.tagline}
            {venueName ? ` · ${venueName}` : ""}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void startStation(station.id)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-5 py-2 font-semibold text-black"
            >
              <Radio className="h-4 w-4" /> Yayına bağlan
            </button>
            <Link href={`/radio/${station.id}`} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold">
              İstasyon
            </Link>
            <Link href="/display" className="inline-flex items-center gap-2 rounded-full bg-[#c8a45a] px-5 py-2 text-sm font-semibold text-black">
              <Tv className="h-4 w-4" /> TV ekranı
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
