import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { feedSchema } from "@/lib/validators";

export async function GET() {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const feeds = await prisma.videoFeed.findMany({ include: { items: { orderBy: { sortOrder: "asc" } } } });
  return NextResponse.json(feeds);
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const parsed = feedSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  const d = parsed.data;
  const feed = await prisma.videoFeed.create({
    data: {
      id: `feed_${crypto.randomUUID()}`,
      name: d.name,
      slug: d.slug,
      description: d.description,
      coverUrl: d.coverUrl,
      venueFit: d.venueFit,
      kind: d.kind,
      isPublished: d.isPublished,
      items: {
        create: d.items.map((item, i) => ({
          url: item.url,
          posterUrl: item.posterUrl,
          caption: item.caption,
          durationSec: item.durationSec,
          sortOrder: i,
        })),
      },
    },
  });
  return NextResponse.json(feed);
}
