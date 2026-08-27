import Link from "next/link";
import { getHomeCatalog, daypartPlaylist } from "@/lib/catalog";
import { getSessionUser } from "@/lib/auth";
import { daypartForHour, greetingForHour } from "@/lib/format";
import { FeedCard, PlaylistCard, Section, StationCard, TrackRow } from "@/components/player/TrackRow";
import { toPlayerTrack } from "@/lib/player-track";
import { termsByKind } from "@/data/catalog";
import { pickStationForContext } from "@/lib/radio";
import { pickStationIdForVenue } from "@/lib/schedule";
import { LiveHero } from "@/components/player/LiveHero";

const DAYPART_TR = {
  morning: "Sabah",
  afternoon: "Öğleden sonra",
  evening: "Akşam",
  night: "Gece",
} as const;

export default async function HomePage() {
  const user = await getSessionUser();
  const hour = new Date().getHours();
  const [{ playlists, recent, stations, feeds, collections }, daypart] = await Promise.all([
    getHomeCatalog(),
    daypartPlaylist(hour),
  ]);
  const queue = recent.map((t) => toPlayerTrack({ ...t, termSlugs: t.terms.map((x) => x.term.slug) }));
  const venueType = user?.venue?.venueType;
  const curated = playlists.filter((p) => !p.isSmart);
  const recommended = venueType ? curated.filter((p) => p.venueFit === venueType) : curated.slice(0, 4);
  const mappedStations = stations.map((s) => ({
    id: s.id,
    venueFit: s.venueFit,
    autoDaypart: s.autoDaypart,
    termSlugs: JSON.parse(s.termSlugsJson || "[]") as string[],
    sortOrder: s.sortOrder,
  }));
  const live = pickStationForContext(mappedStations, hour, venueType);
  const scheduledId = user?.venue
    ? pickStationIdForVenue({
        scheduleJson: user.venue.scheduleJson,
        activeStationId: user.venue.activeStationId,
        venueType,
        hour,
        stations: mappedStations,
      })
    : live?.id;
  const hero = stations.find((s) => s.id === scheduledId) ?? stations.find((s) => s.id === live?.id) ?? stations[0];

  return (
    <div className="aura-gradient -mx-6 px-6 pb-6 pt-2">
      <h1 className="mb-2 text-3xl font-bold">
        {greetingForHour(hour)}
        {user?.venue ? `, ${user.venue.name}` : ""}
      </h1>
      {hero ? (
        <LiveHero
          station={{ id: hero.id, name: hero.name, tagline: hero.tagline, coverUrl: hero.coverUrl }}
          venueName={user?.venue?.name}
          daypartLabel={DAYPART_TR[daypartForHour(hour)]}
        />
      ) : (
        <div className="mb-6" />
      )}

      <Section title="Canlı radyolar" href="/radio">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stations.slice(0, 8).map((st) => (
            <StationCard key={st.id} id={st.id} name={st.name} tagline={st.tagline} coverUrl={st.coverUrl} />
          ))}
        </div>
      </Section>

      <Section title="Video beslemeleri" href="/feeds">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {feeds.map((f) => (
            <FeedCard key={f.id} id={f.id} name={f.name} description={f.description} coverUrl={f.coverUrl} />
          ))}
        </div>
      </Section>

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

      <Section title="Koleksiyonlar">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {collections.map((c) => (
            <Link key={c.id} href={`/collection/${c.slug}`} className="card-hover rounded-lg bg-[#181818] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.coverUrl} alt="" className="mb-3 aspect-square w-full rounded-md object-cover" />
              <h3 className="truncate font-semibold">{c.title}</h3>
              <p className="text-sm text-[#b3b3b3]">{c.artistName}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Hazır programlar" href="/library">
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
