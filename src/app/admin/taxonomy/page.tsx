import { prisma } from "@/lib/db";

export default async function TaxonomyPage() {
  const terms = await prisma.taxonomyTerm.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] });
  const groups = terms.reduce<Record<string, typeof terms>>((acc, t) => {
    acc[t.kind] = acc[t.kind] || [];
    acc[t.kind].push(t);
    return acc;
  }, {});
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Kütüphane taksonomisi</h2>
      {Object.entries(groups).map(([kind, list]) => (
        <section key={kind} className="mb-6">
          <h3 className="mb-2 font-semibold">{kind}</h3>
          <div className="flex flex-wrap gap-2">
            {list.map((t) => (
              <span key={t.id} className="rounded-full px-3 py-1 text-sm text-black" style={{ background: t.color }}>
                {t.nameTr}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
