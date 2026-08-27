import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminHome() {
  const [tracks, playlists, venues, logs] = await Promise.all([
    prisma.track.count(),
    prisma.playlist.count(),
    prisma.venue.count(),
    prisma.aiAssistLog.count(),
  ]);
  const cards = [
    { label: "Parça", value: tracks, href: "/admin/tracks" },
    { label: "Liste", value: playlists, href: "/admin/playlists" },
    { label: "İşletme", value: venues, href: "/admin/venues" },
    { label: "AI öneri", value: logs, href: "/admin/tracks/new" },
  ];
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Katalog özeti</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl bg-[#181818] p-5">
            <p className="text-sm text-[#b3b3b3]">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 max-w-2xl text-[#b3b3b3]">
        Yeni eser yalnızca bu panelden eklenir. Ses, kapak, video ve ek fotoğraflar yüklenebilir; Aura Intelligence
        mekân ve ruh hali etiketlerini önerir. İşletme hesapları çalar, yüklemez.
      </p>
      <Link href="/admin/tracks/new" className="mt-6 inline-block rounded-full bg-[#c8a45a] px-5 py-2 font-semibold text-black">
        Yeni parça
      </Link>
    </div>
  );
}
