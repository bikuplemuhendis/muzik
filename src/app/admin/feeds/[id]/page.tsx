import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { FeedForm } from "@/components/admin/FeedForm";

export default async function EditFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feed = await prisma.videoFeed.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!feed) notFound();
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Beslemeyi düzenle</h2>
      <FeedForm
        initial={{
          id: feed.id,
          name: feed.name,
          slug: feed.slug,
          description: feed.description,
          coverUrl: feed.coverUrl,
          venueFit: feed.venueFit,
          kind: feed.kind,
          isPublished: feed.isPublished,
          items: feed.items.map((i) => ({ url: i.url, posterUrl: i.posterUrl, caption: i.caption })),
        }}
      />
    </div>
  );
}
