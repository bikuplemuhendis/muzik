import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Gövde yok" }, { status: 400 });
  const existing = await prisma.zone.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Yok" }, { status: 404 });
  const data: Record<string, unknown> = {};
  for (const key of ["name", "kind", "stationId", "playlistId", "feedId", "isDefault"]) {
    if (key in body) data[key] = body[key];
  }
  if (data.isDefault) {
    await prisma.zone.updateMany({ where: { venueId: existing.venueId }, data: { isDefault: false } });
  }
  const zone = await prisma.zone.update({ where: { id }, data });
  return NextResponse.json(zone);
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  await prisma.zone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
