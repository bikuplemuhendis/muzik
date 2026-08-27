import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackSchema } from "@/lib/validators";
import { requireApiUser } from "@/lib/api";

async function connectTerms(slugs: string[]) {
  const terms = await prisma.taxonomyTerm.findMany({ where: { slug: { in: slugs } } });
  return terms.map((t) => ({ termId: t.id }));
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Eksik veya hatalı alan" }, { status: 400 });
  }
  const data = parsed.data;
  await prisma.trackTerm.deleteMany({ where: { trackId: id } });
  await prisma.trackMedia.deleteMany({ where: { trackId: id } });
  const track = await prisma.track.update({
    where: { id },
    data: {
      title: data.title,
      artistName: data.artistName,
      collectionName: data.collectionName,
      description: data.description,
      durationSec: data.durationSec,
      bpm: data.bpm ?? null,
      energy: data.energy,
      audioUrl: data.audioUrl,
      coverUrl: data.coverUrl,
      videoUrl: data.videoUrl || null,
      isPublished: data.isPublished,
      licenseId: data.licenseId,
      terms: { create: await connectTerms(data.termSlugs) },
      media: {
        create: data.extraMedia.map((m, i) => ({
          kind: m.kind,
          url: m.url,
          caption: m.caption || "",
          sortOrder: i,
        })),
      },
    },
  });
  return NextResponse.json(track);
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
