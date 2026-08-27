import { prisma } from "@/lib/db";

export default async function LicensesPage() {
  const licenses = await prisma.license.findMany();
  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold">Lisanslar</h2>
      {licenses.map((l) => (
        <article key={l.id} className="mb-6 rounded-xl bg-[#181818] p-5">
          <h3 className="text-lg font-semibold">{l.name}</h3>
          <p className="text-sm text-[#b3b3b3]">{l.summary}</p>
          <p className="mt-2 text-xs text-[#6a6a6a]">
            Ticari kullanım: {l.commercialUse ? "evet" : "hayır"} · Kamu icrası: {l.publicPerformance ? "evet" : "hayır"} ·
            Atıf: {l.attributionRequired ? "zorunlu" : "gerekmez"} · {l.territory}
          </p>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-[#b3b3b3]">{l.body}</pre>
        </article>
      ))}
    </div>
  );
}
