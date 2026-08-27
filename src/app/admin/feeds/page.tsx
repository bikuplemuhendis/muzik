import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminFeedsPage() {
  const feeds = await prisma.videoFeed.findMany({ include: { items: true } });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Video beslemeleri</h2>
        <Link href="/admin/feeds/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
          Ekle
        </Link>
      </div>
      <ul className="space-y-3">
        {feeds.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-xl bg-[#181818] p-4">
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="text-sm text-[#b3b3b3]">{f.description}</p>
              <p className="mt-1 text-xs text-[#6a6a6a]">
                {f.items.length} klip · {f.venueFit} · {f.kind} · {f.isPublished ? "yayında" : "taslak"}
              </p>
            </div>
            <Link href={`/admin/feeds/${f.id}`} className="text-[#c8a45a]">
              Düzenle
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
