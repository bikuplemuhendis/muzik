import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { formatTry } from "@/lib/pricing";
import { ScheduleForm } from "@/components/player/ScheduleForm";
import { VenueOps } from "@/components/player/VenueOps";
import { prisma } from "@/lib/db";

export default async function VenuePage() {
  const user = await getSessionUser();
  const venue = user?.venue;
  const [stations, feeds, zones, playlists] = await Promise.all([
    prisma.radioStation.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.videoFeed.findMany({ where: { isPublished: true } }),
    venue ? prisma.zone.findMany({ where: { venueId: venue.id } }) : Promise.resolve([]),
    prisma.playlist.findMany({ where: { isPublic: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold">İşletmem</h1>
      {!venue ? (
        <p className="text-[#b3b3b3]">Bu hesap bir işletmeye bağlı değil. Admin hesapları katalog yönetir.</p>
      ) : (
        <>
          <p className="text-xl">{venue.name}</p>
          <p className="text-[#b3b3b3]">
            {venue.city} · {venue.venueType} · {venue.locationCount} lokasyon
          </p>
          <div className="my-6 flex flex-wrap gap-3">
            <Link href="/display" className="rounded-full bg-[#c8a45a] px-5 py-2 font-semibold text-black">
              TV / kiosk ekranı
            </Link>
            <Link href="/certificate" className="rounded-full bg-white px-5 py-2 font-semibold text-black">
              Ticari icra belgesi
            </Link>
          </div>
          <div className="my-6 rounded-xl bg-[#181818] p-5">
            <p className="text-sm text-[#c8a45a]">Aktif plan</p>
            <p className="text-2xl font-bold">{venue.plan.name}</p>
            <p className="text-[#b3b3b3]">
              {formatTry(venue.plan.monthlyPriceTry)} / ay · {venue.plan.maxLocations === 999 ? "sınırsız" : venue.plan.maxLocations} lokasyon
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-[#b3b3b3]">
              {(JSON.parse(venue.plan.featuresJson) as string[]).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <VenueOps
            stations={stations.map((s) => ({ id: s.id, name: s.name }))}
            feeds={feeds.map((f) => ({ id: f.id, name: f.name }))}
            activeStationId={venue.activeStationId}
            activeFeedId={venue.activeFeedId}
            displayMessage={venue.displayMessage}
            accentColor={venue.accentColor}
            zones={zones.map((z) => ({ id: z.id, name: z.name, kind: z.kind, stationId: z.stationId, feedId: z.feedId }))}
          />
          <div className="mt-6">
            <ScheduleForm
              venueId={venue.id}
              maxLocations={venue.plan.maxLocations}
              locationCount={venue.locationCount}
              scheduleJson={venue.scheduleJson}
              stations={stations.map((s) => ({ id: s.id, name: s.name }))}
              playlists={playlists.map((p) => ({ id: p.id, title: p.title }))}
              feeds={feeds.map((f) => ({ id: f.id, name: f.name }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
