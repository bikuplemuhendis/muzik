import { prisma } from "@/lib/db";
import { PlaylistCard, Section } from "@/components/player/TrackRow";
import { toPlayerTrack } from "@/lib/player-track";
import { termsByKind } from "@/data/catalog";
import Link from "next/link";

export default async function LibraryPage() {
  const playlists = await prisma.playlist.findMany({
    where: { isPublic: true },
    include: { tracks: { include: { track: true }, orderBy: { position: "asc" } } },
  });
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Kitaplığın</h1>
      <Section title="Küratör listeleri">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              id={pl.id}
              title={pl.title}
              description={pl.description}
              coverUrl={pl.coverUrl}
              tracks={pl.tracks.map((t) => toPlayerTrack(t.track))}
            />
          ))}
        </div>
      </Section>
      <Section title="Ruh hali">
        <div className="flex flex-wrap gap-2">
          {termsByKind("MOOD").map((t) => (
            <Link key={t.slug} href={`/browse/mood/${t.slug}`} className="rounded-full px-4 py-2 text-sm text-black" style={{ background: t.color }}>
              {t.nameTr}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
