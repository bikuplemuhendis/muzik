import { prisma } from "@/lib/db";
import { countBy, playsByHour, playsBySource, playsByStation } from "@/lib/analytics";

export default async function AnalyticsPage() {
  const events = await prisma.playEvent.findMany({
    include: { track: true, venue: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const likes = events.map((e) => ({
    source: e.source,
    stationId: e.stationId,
    createdAt: e.createdAt,
    trackTitle: e.track.title,
  }));
  const top = countBy(likes, (e) => e.trackTitle ?? "—").slice(0, 8);
  const hours = playsByHour(likes);
  const maxHour = Math.max(1, ...hours.map((h) => h.count));
  const sources = playsBySource(likes);
  const stations = playsByStation(likes).filter(([id]) => id !== "—");
  const stationNames = Object.fromEntries(
    (
      await prisma.radioStation.findMany({
        where: { id: { in: stations.map(([id]) => id) } },
        select: { id: true, name: true },
      })
    ).map((s) => [s.id, s.name]),
  );

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Çalma analitikleri</h2>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-[#181818] p-4">
          <p className="text-sm text-[#b3b3b3]">Olay</p>
          <p className="text-3xl font-bold">{events.length}</p>
        </div>
        <div className="rounded-xl bg-[#181818] p-4">
          <p className="text-sm text-[#b3b3b3]">Kaynak</p>
          <ul className="mt-2 space-y-1 text-sm">
            {sources.map(([name, n]) => (
              <li key={name} className="flex justify-between">
                <span>{name}</span>
                <span className="text-[#c8a45a]">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-[#181818] p-4">
          <p className="text-sm text-[#b3b3b3]">İstasyon</p>
          <ul className="mt-2 space-y-1 text-sm">
            {stations.slice(0, 6).map(([id, n]) => (
              <li key={id} className="flex justify-between">
                <span>{stationNames[id] ?? id}</span>
                <span className="text-[#c8a45a]">{n}</span>
              </li>
            ))}
            {!stations.length ? <li className="text-[#6a6a6a]">Henüz radyo çalma yok</li> : null}
          </ul>
        </div>
      </div>

      <h3 className="mb-2 font-semibold">Saat dağılımı</h3>
      <div className="mb-8 flex h-24 items-end gap-1 rounded-xl bg-[#181818] p-3">
        {hours.map((h) => (
          <div key={h.hour} className="flex flex-1 flex-col items-center justify-end" title={`${h.hour}:00 · ${h.count}`}>
            <div
              className="w-full rounded-sm bg-[#c8a45a]"
              style={{ height: `${Math.max(4, (h.count / maxHour) * 100)}%`, opacity: h.count ? 1 : 0.2 }}
            />
          </div>
        ))}
      </div>

      <h3 className="mb-2 font-semibold">Bu örneklemde en çok</h3>
      <ul className="mb-8 space-y-1 text-sm">
        {top.map(([title, n]) => (
          <li key={title} className="flex justify-between rounded bg-[#181818] px-3 py-2">
            <span>{title}</span>
            <span className="text-[#c8a45a]">{n}</span>
          </li>
        ))}
      </ul>
      <h3 className="mb-2 font-semibold">Son olaylar</h3>
      <table className="w-full text-left text-sm">
        <thead className="text-[#6a6a6a]">
          <tr>
            <th className="py-2">Parça</th>
            <th>Kaynak</th>
            <th>İşletme</th>
            <th>İstasyon</th>
          </tr>
        </thead>
        <tbody>
          {events.slice(0, 50).map((e) => (
            <tr key={e.id} className="border-t border-white/10">
              <td className="py-2">{e.track.title}</td>
              <td>{e.source}</td>
              <td>{e.venue?.name ?? "—"}</td>
              <td className="text-[#6a6a6a]">{e.stationId || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
