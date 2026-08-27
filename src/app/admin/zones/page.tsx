import { prisma } from "@/lib/db";
import { ZoneForm } from "@/components/admin/ZoneForm";
import { ZoneRow } from "@/components/admin/ZoneRow";

export default async function AdminZonesPage() {
  const [zones, venues, stations, feeds, playlists] = await Promise.all([
    prisma.zone.findMany({ include: { venue: true } }),
    prisma.venue.findMany({ orderBy: { name: "asc" } }),
    prisma.radioStation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.videoFeed.findMany({ orderBy: { name: "asc" } }),
    prisma.playlist.findMany({ where: { isPublic: true }, orderBy: { title: "asc" } }),
  ]);
  const stationOpts = stations.map((s) => ({ id: s.id, name: s.name }));
  const feedOpts = feeds.map((f) => ({ id: f.id, name: f.name }));
  const playlistOpts = playlists.map((p) => ({ id: p.id, title: p.title }));
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Bölgeler</h2>
      <p className="mb-6 text-sm text-[#b3b3b3]">
        Lokasyon içi lobi / restoran / teras atamaları. TV ekranı zone parametresi ile açılır.
      </p>
      <ZoneForm
        venues={venues.map((v) => ({ id: v.id, name: v.name }))}
        stations={stationOpts}
        playlists={playlistOpts}
        feeds={feedOpts}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[#6a6a6a]">
            <tr>
              <th className="py-2">Bölge</th>
              <th>Tür</th>
              <th>Radyo</th>
              <th>Liste</th>
              <th>Video</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <ZoneRow key={z.id} zone={z} stations={stationOpts} feeds={feedOpts} playlists={playlistOpts} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
