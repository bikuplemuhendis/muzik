import Link from "next/link";
import { prisma } from "@/lib/db";
import { StationPublish } from "@/components/admin/StationPublish";

export default async function AdminStationsPage() {
  const stations = await prisma.radioStation.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Radyo istasyonları</h2>
        <Link href="/admin/stations/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
          Ekle
        </Link>
      </div>
      <p className="mb-4 max-w-2xl text-sm text-[#b3b3b3]">
        Her istasyon enerji/BPM/etiket kurallarıyla sürekli kuyruk üretir. Gün dilimi açık olanlar saate göre kayar.
      </p>
      <ul className="space-y-2">
        {stations.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg bg-[#181818] px-4 py-3">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-[#6a6a6a]">
                {s.venueFit} · enerji {s.energyMin}-{s.energyMax} · {s.autoDaypart ? "otomatik gün" : "sabit"} ·{" "}
                {s.isPublished ? "yayında" : "taslak"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/admin/stations/${s.id}`} className="text-sm text-white hover:underline">
                Düzenle
              </Link>
              <StationPublish id={s.id} published={s.isPublished} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
