import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminPlaylistsPage() {
  const playlists = await prisma.playlist.findMany({ include: { tracks: true } });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Çalma listeleri</h2>
        <Link href="/admin/playlists/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
          Ekle
        </Link>
      </div>
      <ul className="space-y-2">
        {playlists.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-lg bg-[#181818] px-4 py-3">
            <span>
              {p.title} <span className="text-sm text-[#6a6a6a]">{p.tracks.length} parça</span>
            </span>
            <Link href={`/admin/playlists/${p.id}`} className="text-[#c8a45a]">
              Düzenle
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
