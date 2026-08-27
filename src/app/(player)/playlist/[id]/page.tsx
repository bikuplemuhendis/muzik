import { notFound } from "next/navigation";
import { getPlaylist } from "@/lib/catalog";
import { TrackRow } from "@/components/player/TrackRow";
import { PlayButton } from "@/components/player/PlayButton";
import { toPlayerTrack } from "@/lib/player-track";

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playlist = await getPlaylist(id);
  if (!playlist) notFound();
  const queue = playlist.tracks.map((t) => toPlayerTrack(t.track));
  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={playlist.coverUrl} alt="" className="h-52 w-52 rounded shadow-2xl" />
        <div>
          <p className="text-sm font-semibold">Çalma listesi</p>
          <h1 className="text-5xl font-bold">{playlist.title}</h1>
          <p className="mt-3 max-w-xl text-[#b3b3b3]">{playlist.description}</p>
          <p className="mt-2 text-sm text-[#b3b3b3]">{queue.length} parça · {playlist.venueFit || "çoklu mekân"}</p>
          <div className="mt-4">
            <PlayButton tracks={queue} />
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-black/20 p-2">
        {queue.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={queue} />
        ))}
      </div>
    </div>
  );
}
