import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user?.venue) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { scheduleJson?: string; locationCount?: number } | null;
  const data: { scheduleJson?: string; locationCount?: number } = {};
  if (typeof body?.scheduleJson === "string") data.scheduleJson = body.scheduleJson;
  if (typeof body?.locationCount === "number") data.locationCount = body.locationCount;
  const venue = await prisma.venue.update({
    where: { id: user.venue.id },
    data,
  });
  return NextResponse.json(venue);
}
