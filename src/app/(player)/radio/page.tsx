import { prisma } from "@/lib/db";
import { StationCard, Section } from "@/components/player/TrackRow";
import { RadioTuneIn } from "@/components/player/RadioTuneIn";

export default async function RadioIndexPage() {
  const stations = await prisma.radioStation.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Radyo</h1>
          <p className="max-w-2xl text-[#b3b3b3]">
            Sabit liste değil: enerji, mekân ve gün dilimine göre sürekli kuyruk. Parça bitince benzer bir sonraki gelir, son
            çalınanlar tekrar etmez.
          </p>
        </div>
        <RadioTuneIn stationId="auto" />
      </div>
      <Section title="İstasyonlar">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stations.map((st) => (
            <StationCard key={st.id} id={st.id} name={st.name} tagline={st.tagline} coverUrl={st.coverUrl} />
          ))}
        </div>
      </Section>
    </div>
  );
}
