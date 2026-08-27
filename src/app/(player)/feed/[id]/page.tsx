import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feed = await prisma.videoFeed.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!feed || !feed.isPublished) notFound();
  return (
    <div className="max-w-4xl">
      <p className="text-xs uppercase tracking-[0.2em] text-[#c8a45a]">Video beslemesi</p>
      <h1 className="mb-2 text-4xl font-bold">{feed.name}</h1>
      <p className="mb-6 text-[#b3b3b3]">{feed.description}</p>
      <Link href={`/display?feed=${feed.id}`} className="mb-8 inline-block rounded-full bg-[#c8a45a] px-5 py-2 font-semibold text-black">
        Bu beslemeyi TV’de aç
      </Link>
      <div className="grid gap-6">
        {feed.items.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-xl bg-black">
            <video src={item.url} poster={item.posterUrl || undefined} className="w-full" controls muted loop playsInline />
            <figcaption className="px-4 py-2 text-sm text-[#b3b3b3]">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
