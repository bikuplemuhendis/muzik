import { prisma } from "@/lib/db";
import { TrackRow } from "@/components/player/TrackRow";
import { PlayButton } from "@/components/player/PlayButton";
import { toPlayerTrack } from "@/lib/player-track";
import { publishedTrackInclude } from "@/lib/catalog";
import { notFound } from "next/navigation";

export default async function ArtistPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const artistName = decodeURIComponent(name);
  const include = await publishedTrackInclude();
  const tracks = await prisma.track.findMany({
    where: { isPublished: true, artistName },
    include,
  });
  if (!tracks.length) notFound();
  const queue = tracks.map((t) => toPlayerTrack(t));
  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">{artistName}</h1>
      <p className="mb-4 text-[#b3b3b3]">Aura in-house / proje adı</p>
      <PlayButton tracks={queue} />
      <div className="mt-6">
        {queue.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={queue} />
        ))}
      </div>
    </div>
  );
}
