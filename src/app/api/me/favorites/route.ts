import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { publishedTrackInclude } from "@/lib/catalog";
import { toPlayerTrack } from "@/lib/player-track";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const include = await publishedTrackInclude();
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { track: { include } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    ids: favs.map((f) => f.trackId),
    tracks: favs.map((f) => toPlayerTrack({ ...f.track, termSlugs: f.track.terms.map((t) => t.term.slug) })),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { trackId?: string } | null;
  if (!body?.trackId) return NextResponse.json({ error: "trackId gerekli" }, { status: 400 });
  const existing = await prisma.favorite.findUnique({
    where: { userId_trackId: { userId: user.id, trackId: body.trackId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_trackId: { userId: user.id, trackId: body.trackId } } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, trackId: body.trackId } });
  return NextResponse.json({ favorited: true });
}
