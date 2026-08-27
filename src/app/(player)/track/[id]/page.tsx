import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrack } from "@/lib/catalog";
import { PlayButton } from "@/components/player/PlayButton";
import { toPlayerTrack } from "@/lib/player-track";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track || !track.isPublished) notFound();
  const player = toPlayerTrack(track);
  return (
    <div className="max-w-4xl">
      <div className="mb-8 grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          {track.videoUrl ? (
            <video src={track.videoUrl} poster={track.coverUrl} className="w-full rounded-lg" autoPlay muted loop playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.coverUrl} alt="" className="w-full rounded-lg" />
          )}
        </div>
        <div>
          <p className="text-sm text-[#c8a45a]">{track.collectionName}</p>
          <h1 className="text-4xl font-bold">{track.title}</h1>
          <p className="mt-2 text-lg text-[#b3b3b3]">{track.artistName}</p>
          <p className="mt-4 text-[#b3b3b3]">{track.description}</p>
          <p className="mt-3 text-sm text-[#6a6a6a]">
            {track.bpm} BPM · enerji {track.energy}/5 · {track.license.name}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {track.terms.map((tt) => (
              <Link key={tt.termId} href={`/browse/${tt.term.kind.toLowerCase()}/${tt.term.slug}`} className="rounded-full bg-[#282828] px-3 py-1 text-xs">
                {tt.term.nameTr}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <PlayButton tracks={[player]} />
          </div>
        </div>
      </div>
      {track.media.length ? (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Mekân referansları</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {track.media.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={m.url} alt={m.caption} className="rounded-lg object-cover" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
