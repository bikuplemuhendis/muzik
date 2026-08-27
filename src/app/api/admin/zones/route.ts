import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { zoneSchema } from "@/lib/validators";

export async function GET() {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const zones = await prisma.zone.findMany({ include: { venue: true } });
  return NextResponse.json(zones);
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const parsed = zoneSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  if (parsed.data.isDefault) {
    await prisma.zone.updateMany({ where: { venueId: parsed.data.venueId }, data: { isDefault: false } });
  }
  const zone = await prisma.zone.create({
    data: {
      id: `zone_${crypto.randomUUID()}`,
      ...parsed.data,
    },
  });
  return NextResponse.json(zone);
}
