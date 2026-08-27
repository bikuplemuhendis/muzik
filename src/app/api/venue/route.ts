import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user?.venue) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    scheduleJson?: string;
    locationCount?: number;
    activeStationId?: string;
    activeFeedId?: string;
    displayMessage?: string;
    accentColor?: string;
  } | null;
  const data: Record<string, string | number> = {};
  if (typeof body?.scheduleJson === "string") data.scheduleJson = body.scheduleJson;
  if (typeof body?.locationCount === "number") data.locationCount = body.locationCount;
  if (typeof body?.activeStationId === "string") data.activeStationId = body.activeStationId;
  if (typeof body?.activeFeedId === "string") data.activeFeedId = body.activeFeedId;
  if (typeof body?.displayMessage === "string") data.displayMessage = body.displayMessage;
  if (typeof body?.accentColor === "string") data.accentColor = body.accentColor;
  const venue = await prisma.venue.update({
    where: { id: user.venue.id },
    data,
  });
  return NextResponse.json(venue);
}
