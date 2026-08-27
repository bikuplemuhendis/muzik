import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { feedSchema } from "@/lib/validators";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  const parsed = feedSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  const d = parsed.data;
  await prisma.videoFeedItem.deleteMany({ where: { feedId: id } });
  const feed = await prisma.videoFeed.update({
    where: { id },
    data: {
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

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  await prisma.videoFeed.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
