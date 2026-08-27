import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StationForm } from "@/components/admin/StationForm";

export default async function EditStationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await prisma.radioStation.findUnique({ where: { id } });
  if (!station) notFound();
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Radyoyu düzenle</h2>
      <StationForm
        initial={{
          id: station.id,
          name: station.name,
          slug: station.slug,
          tagline: station.tagline,
          coverUrl: station.coverUrl,
          venueFit: station.venueFit,
          mood: station.mood,
          energyMin: station.energyMin,
          energyMax: station.energyMax,
          bpmMin: station.bpmMin,
          bpmMax: station.bpmMax,
          termSlugs: JSON.parse(station.termSlugsJson || "[]").join(", "),
          autoDaypart: station.autoDaypart,
          crossfadeSec: station.crossfadeSec,
          isPublished: station.isPublished,
          sortOrder: station.sortOrder,
          feedId: station.feedId,
          seedPlaylistId: station.seedPlaylistId,
        }}
      />
    </div>
  );
}
