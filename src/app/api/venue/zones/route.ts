import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user?.venue) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Bölge yok" }, { status: 400 });
  const zone = await prisma.zone.findUnique({ where: { id } });
  if (!zone || zone.venueId !== user.venue.id) {
    return NextResponse.json({ error: "Bu bölge size ait değil" }, { status: 403 });
  }
  const data: Record<string, unknown> = {};
  for (const key of ["name", "kind", "stationId", "playlistId", "feedId", "isDefault"]) {
    if (body && key in body) data[key] = body[key];
  }
  if (data.isDefault) {
    await prisma.zone.updateMany({ where: { venueId: user.venue.id }, data: { isDefault: false } });
  }
  const updated = await prisma.zone.update({ where: { id: zone.id }, data });
  return NextResponse.json(updated);
}
