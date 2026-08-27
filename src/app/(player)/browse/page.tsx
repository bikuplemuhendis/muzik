import Link from "next/link";
import { termsByKind } from "@/data/catalog";

const groups = [
  { kind: "VENUE" as const, title: "Mekân türü" },
  { kind: "MOOD" as const, title: "Ruh hali" },
  { kind: "GENRE" as const, title: "Tür" },
  { kind: "DAYPART" as const, title: "Gün dilimi" },
];

export default function BrowsePage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Katalog</h1>
      {groups.map((g) => (
        <section key={g.kind} className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">{g.title}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {termsByKind(g.kind).map((t) => (
              <Link
                key={t.slug}
                href={`/browse/${g.kind.toLowerCase()}/${t.slug}`}
                className="rounded-lg p-4 font-semibold text-black"
                style={{ background: t.color }}
              >
                {t.nameTr}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
