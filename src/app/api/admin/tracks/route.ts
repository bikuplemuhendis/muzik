import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackSchema } from "@/lib/validators";
import { requireApiUser } from "@/lib/api";

async function connectTerms(slugs: string[]) {
  const terms = await prisma.taxonomyTerm.findMany({ where: { slug: { in: slugs } } });
  return terms.map((t) => ({ termId: t.id }));
}

export async function GET() {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: "desc" },
    include: { terms: { include: { term: true } }, license: true },
  });
  return NextResponse.json(tracks);
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Eksik veya hatalı alan", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const id = `trk_${crypto.randomUUID()}`;
  const track = await prisma.track.create({
    data: {
      id,
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
      createdById: user.id,
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
