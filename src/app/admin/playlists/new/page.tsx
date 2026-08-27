import { prisma } from "@/lib/db";
import { PlaylistForm } from "@/components/admin/PlaylistForm";

export default async function NewPlaylistPage() {
  const tracks = await prisma.track.findMany({ orderBy: { title: "asc" } });
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Yeni liste</h2>
      <PlaylistForm tracks={tracks.map((t) => ({ id: t.id, title: t.title, artistName: t.artistName }))} />
    </div>
  );
}
