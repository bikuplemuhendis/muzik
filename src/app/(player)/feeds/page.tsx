import { prisma } from "@/lib/db";
import { FeedCard, Section } from "@/components/player/TrackRow";

export default async function FeedsPage() {
  const feeds = await prisma.videoFeed.findMany({
    where: { isPublished: true },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Video beslemeleri</h1>
      <p className="mb-8 max-w-2xl text-[#b3b3b3]">
        Lobi duvarı, vitrin ve spa ekranları için sessiz görsel döngüler. TV ekranı ile radyoya kilitlenir.
      </p>
      <Section title="Kanallar">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {feeds.map((f) => (
            <FeedCard key={f.id} id={f.id} name={f.name} description={f.description} coverUrl={f.coverUrl} />
          ))}
        </div>
      </Section>
    </div>
  );
}
