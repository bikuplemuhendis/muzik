import { notFound } from "next/navigation";
import { browseByTerm } from "@/lib/catalog";
import { PlaylistCard, TrackRow } from "@/components/player/TrackRow";
import { toPlayerTrack } from "@/lib/player-track";

export default async function BrowseTermPage({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const data = await browseByTerm(kind, slug);
  if (!data) notFound();
  const queue = data.tracks.map(toPlayerTrack);
  return (
    <div>
      <p className="text-sm uppercase tracking-wider text-[#c8a45a]">{data.term.kind}</p>
      <h1 className="mb-2 text-4xl font-bold">{data.term.nameTr}</h1>
      <p className="mb-8 text-[#b3b3b3]">{data.tracks.length} parça</p>
      {data.playlists.length ? (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.playlists.map((pl) => (
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
      ) : null}
      <div className="rounded-xl bg-black/30 p-2">
        {queue.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={queue} />
        ))}
      </div>
    </div>
  );
}
