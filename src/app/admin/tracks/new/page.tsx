import { prisma } from "@/lib/db";
import { TrackForm } from "@/components/admin/TrackForm";

export default async function NewTrackPage() {
  const [licenses, terms] = await Promise.all([
    prisma.license.findMany(),
    prisma.taxonomyTerm.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Yeni parça</h2>
      <TrackForm
        licenses={licenses.map((l) => ({ id: l.id, name: l.name }))}
        terms={terms.map((t) => ({ slug: t.slug, nameTr: t.nameTr, kind: t.kind }))}
      />
    </div>
  );
}
