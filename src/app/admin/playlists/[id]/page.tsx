import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlaylistForm } from "@/components/admin/PlaylistForm";

export default async function EditPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [playlist, tracks] = await Promise.all([
    prisma.playlist.findUnique({
      where: { id },
      include: { tracks: { orderBy: { position: "asc" } } },
    }),
    prisma.track.findMany({ orderBy: { title: "asc" } }),
  ]);
  if (!playlist) notFound();
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Listeyi düzenle</h2>
      <PlaylistForm
        tracks={tracks.map((t) => ({ id: t.id, title: t.title, artistName: t.artistName }))}
        initial={{
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          coverUrl: playlist.coverUrl,
          venueFit: playlist.venueFit,
          isPublic: playlist.isPublic,
          trackIds: playlist.tracks.map((t) => t.trackId),
        }}
      />
    </div>
  );
}
