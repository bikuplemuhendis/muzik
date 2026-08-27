import Link from "next/link";
import { getHomeCatalog, daypartPlaylist } from "@/lib/catalog";
import { getSessionUser } from "@/lib/auth";
import { greetingForHour } from "@/lib/format";
import { PlaylistCard, Section, TrackRow } from "@/components/player/TrackRow";
import { toPlayerTrack } from "@/lib/player-track";
import { termsByKind } from "@/data/catalog";

export default async function HomePage() {
  const user = await getSessionUser();
  const hour = new Date().getHours();
  const [{ playlists, recent }, daypart] = await Promise.all([getHomeCatalog(), daypartPlaylist(hour)]);
  const queue = recent.map(toPlayerTrack);
  const venueType = user?.venue?.venueType;
  const recommended = venueType ? playlists.filter((p) => p.venueFit === venueType) : playlists.slice(0, 4);

  return (
    <div className="aura-gradient -mx-6 px-6 pb-6 pt-2">
      <h1 className="mb-6 text-3xl font-bold">
        {greetingForHour(hour)}
        {user?.venue ? `, ${user.venue.name}` : ""}
      </h1>

      <Section title="Mekânınıza önerilenler">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {recommended.map((pl) => (
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

      <Section title="Günün dilimi" href="/browse">
        <div className="rounded-xl bg-black/30 p-2">
          {daypart.tracks.slice(0, 6).map((t, i) => (
            <TrackRow key={t.id} track={toPlayerTrack(t)} index={i} queue={daypart.tracks.map(toPlayerTrack)} />
          ))}
        </div>
      </Section>

      <Section title="Hazır programlar" href="/library">
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

      <Section title="Yeni katalog">
        <div className="rounded-xl bg-black/30 p-2">
          {queue.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} queue={queue} />
          ))}
        </div>
      </Section>

      <Section title="Mekân türleri">
        <div className="flex flex-wrap gap-2">
          {termsByKind("VENUE").map((t) => (
            <Link
              key={t.slug}
              href={`/browse/venue/${t.slug}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-black"
              style={{ background: t.color }}
            >
              {t.nameTr}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
