import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    trackId?: string;
    stationId?: string;
    source?: string;
  } | null;
  if (!body?.trackId) return NextResponse.json({ error: "trackId gerekli" }, { status: 400 });
  const event = await prisma.playEvent.create({
    data: {
      userId: user.id,
      venueId: user.venueId,
      trackId: body.trackId,
      stationId: body.stationId ?? "",
      source: body.source ?? "player",
    },
  });
  return NextResponse.json({ ok: true, id: event.id });
}
