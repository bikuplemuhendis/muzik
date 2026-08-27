import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminTracksPage() {
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: "desc" },
    include: { license: true, terms: { include: { term: true } } },
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Parçalar</h2>
        <Link href="/admin/tracks/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
          Ekle
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#181818] text-[#b3b3b3]">
            <tr>
              <th className="px-4 py-2">Parça</th>
              <th className="px-4 py-2">Yayın</th>
              <th className="px-4 py-2">Etiket</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr key={t.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.coverUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    <div>
                      <div>{t.title}</div>
                      <div className="text-xs text-[#6a6a6a]">{t.artistName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{t.isPublished ? "Açık" : "Taslak"}</td>
                <td className="px-4 py-3 text-xs text-[#b3b3b3]">
                  {t.terms
                    .slice(0, 4)
                    .map((x) => x.term.nameTr)
                    .join(" · ")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/tracks/${t.id}`} className="text-[#c8a45a]">
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
