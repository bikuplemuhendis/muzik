import { prisma } from "@/lib/db";
import { getPlaylist } from "@/lib/catalog";
import { PlaylistCard, Section, StationCard } from "@/components/player/TrackRow";
import { toPlayerTrack } from "@/lib/player-track";
import { termsByKind } from "@/data/catalog";
import Link from "next/link";

export default async function LibraryPage() {
  const [playlists, stations] = await Promise.all([
    prisma.playlist.findMany({
      where: { isPublic: true },
      include: { tracks: { include: { track: true }, orderBy: { position: "asc" } } },
    }),
    prisma.radioStation.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const smart = playlists.filter((p) => p.isSmart);
  const curated = playlists.filter((p) => !p.isSmart);
  const smartResolved = await Promise.all(smart.map((p) => getPlaylist(p.id)));
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Kitaplığın</h1>
      <p className="mb-6">
        <Link href="/favorites" className="text-[#c8a45a] hover:underline">
          Favoriler ve son çalınanlar →
        </Link>
      </p>
      <Section title="Radyolar" href="/radio">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stations.map((st) => (
            <StationCard key={st.id} id={st.id} name={st.name} tagline={st.tagline} coverUrl={st.coverUrl} />
          ))}
        </div>
      </Section>
      <Section title="Akıllı listeler">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {smartResolved.filter(Boolean).map((pl) => (
            <PlaylistCard
              key={pl!.id}
              id={pl!.id}
              title={pl!.title}
              description={pl!.description}
              coverUrl={pl!.coverUrl}
              tracks={pl!.tracks.map((t) => toPlayerTrack(t.track))}
            />
          ))}
        </div>
      </Section>
      <Section title="Küratör listeleri">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {curated.map((pl) => (
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
