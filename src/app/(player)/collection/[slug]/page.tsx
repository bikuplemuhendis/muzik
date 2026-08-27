import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TrackRow } from "@/components/player/TrackRow";
import { PlayButton } from "@/components/player/PlayButton";
import { toPlayerTrack } from "@/lib/player-track";
import { publishedTrackInclude } from "@/lib/catalog";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const col = await prisma.collection.findUnique({ where: { slug } });
  if (!col) notFound();
  const include = await publishedTrackInclude();
  const tracks = await prisma.track.findMany({
    where: { isPublished: true, collectionName: col.title },
    include,
  });
  const queue = tracks.map((t) => toPlayerTrack(t));
  return (
    <div>
      <div className="mb-8 flex gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={col.coverUrl} alt="" className="h-44 w-44 rounded shadow-xl" />
        <div>
          <p className="text-sm text-[#c8a45a]">Koleksiyon</p>
          <h1 className="text-4xl font-bold">{col.title}</h1>
          <p className="mt-2 text-[#b3b3b3]">{col.description}</p>
          <p className="text-sm text-[#6a6a6a]">{col.artistName}</p>
          <div className="mt-4">
            <PlayButton tracks={queue} />
          </div>
        </div>
      </div>
      {queue.map((t, i) => (
        <TrackRow key={t.id} track={t} index={i} queue={queue} />
      ))}
    </div>
  );
}
