import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminHome() {
  const [tracks, playlists, venues, stations, feeds, plays, logs] = await Promise.all([
    prisma.track.count(),
    prisma.playlist.count(),
    prisma.venue.count(),
    prisma.radioStation.count(),
    prisma.videoFeed.count(),
    prisma.playEvent.count(),
    prisma.aiAssistLog.count(),
  ]);
  const cards = [
    { label: "Parça", value: tracks, href: "/admin/tracks" },
    { label: "Radyo", value: stations, href: "/admin/stations" },
    { label: "Video", value: feeds, href: "/admin/feeds" },
    { label: "Çalma olayı", value: plays, href: "/admin/analytics" },
    { label: "Liste", value: playlists, href: "/admin/playlists" },
    { label: "İşletme", value: venues, href: "/admin/venues" },
    { label: "AI öneri", value: logs, href: "/admin/tracks/new" },
  ];
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">İşletim özeti</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl bg-[#181818] p-5">
            <p className="text-sm text-[#b3b3b3]">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 max-w-2xl text-[#b3b3b3]">
        Katalog, radyo kuralları, video beslemeleri ve bölge atamaları bu panelden yönetilir. İşletme hesapları yalnızca çalar
        ve TV ekranını açar.
      </p>
    </div>
  );
}
