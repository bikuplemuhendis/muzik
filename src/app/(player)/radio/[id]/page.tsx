import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RadioTuneIn } from "@/components/player/RadioTuneIn";
import { getPublishedRadioCatalog, toRadioTrack } from "@/lib/catalog";
import { pickRadioQueue, stationProfile } from "@/lib/radio";
import { toPlayerTrack } from "@/lib/player-track";
import { TrackRow } from "@/components/player/TrackRow";

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await prisma.radioStation.findUnique({ where: { id } });
  if (!station || !station.isPublished) notFound();
  const catalog = await getPublishedRadioCatalog();
  const profile = stationProfile(station);
  const picked = pickRadioQueue(catalog.map(toRadioTrack), profile, 10, () => 0);
  const preview = picked
    .map((p) => catalog.find((t) => t.id === p.id))
    .filter(Boolean)
    .map((t) => toPlayerTrack({ ...t!, termSlugs: t!.terms.map((x) => x.term.slug) }));
  const feed = station.feedId ? await prisma.videoFeed.findUnique({ where: { id: station.feedId } }) : null;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={station.coverUrl} alt="" className="h-52 w-52 rounded shadow-2xl" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8a45a]">Radyo istasyonu</p>
          <h1 className="text-5xl font-bold">{station.name}</h1>
          <p className="mt-3 max-w-xl text-[#b3b3b3]">{station.tagline}</p>
          <p className="mt-2 text-sm text-[#6a6a6a]">
            Enerji {station.energyMin}–{station.energyMax} · BPM {station.bpmMin}–{station.bpmMax}
            {station.autoDaypart ? " · gün dilimi otomatik" : ""}
            {feed ? ` · video: ${feed.name}` : ""}
          </p>
          <div className="mt-4">
            <RadioTuneIn stationId={station.id} />
          </div>
        </div>
      </div>
      <h2 className="mb-3 text-xl font-semibold">Örnek kuyruk</h2>
      <div className="rounded-xl bg-black/20 p-2">
        {preview.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={preview} />
        ))}
      </div>
    </div>
  );
}
