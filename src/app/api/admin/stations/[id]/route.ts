import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  const station = await prisma.radioStation.findUnique({ where: { id } });
  if (!station) return NextResponse.json({ error: "Yok" }, { status: 404 });
  return NextResponse.json(station);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Gövde yok" }, { status: 400 });
  const data: Record<string, unknown> = {};
  for (const key of [
    "name",
    "slug",
    "tagline",
    "coverUrl",
    "venueFit",
    "mood",
    "energyMin",
    "energyMax",
    "bpmMin",
    "bpmMax",
    "seedPlaylistId",
    "feedId",
    "autoDaypart",
    "crossfadeSec",
    "isPublished",
    "sortOrder",
  ]) {
    if (key in body) data[key] = body[key];
  }
  if (Array.isArray(body.termSlugs)) data.termSlugsJson = JSON.stringify(body.termSlugs);
  const station = await prisma.radioStation.update({ where: { id }, data });
  return NextResponse.json(station);
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  await prisma.radioStation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
