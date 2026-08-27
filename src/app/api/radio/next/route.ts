import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { pickRadioQueue, stationProfile, type RadioTrack } from "@/lib/radio";
import { getPublishedRadioCatalog, toRadioTrack, publishedTrackInclude } from "@/lib/catalog";
import { toPlayerTrack } from "@/lib/player-track";
import { pickStationIdForVenue } from "@/lib/schedule";

function toPlayer(t: Awaited<ReturnType<typeof getPublishedRadioCatalog>>[number]) {
  return toPlayerTrack({
    ...t,
    termSlugs: t.terms.map((x) => x.term.slug),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    stationId?: string;
    seedTrackId?: string;
    excludeIds?: string[];
    count?: number;
  } | null;
  const catalog = await getPublishedRadioCatalog();
  const exclude = body?.excludeIds ?? [];
  let profile;
  let station = null;
  let requestedId = body?.stationId;
  if (requestedId === "auto") {
    const stations = await prisma.radioStation.findMany({ where: { isPublished: true } });
    requestedId = pickStationIdForVenue({
      scheduleJson: user.venue?.scheduleJson ?? "{}",
      activeStationId: user.venue?.activeStationId ?? "",
      venueType: user.venue?.venueType,
      hour: new Date().getHours(),
      stations: stations.map((s) => ({
        id: s.id,
        venueFit: s.venueFit,
        autoDaypart: s.autoDaypart,
        termSlugs: JSON.parse(s.termSlugsJson || "[]") as string[],
        sortOrder: s.sortOrder,
      })),
    });
  }
  if (requestedId) {
    station = await prisma.radioStation.findUnique({ where: { id: requestedId } });
    if (!station) return NextResponse.json({ error: "İstasyon yok" }, { status: 404 });
    profile = stationProfile(station, new Date().getHours(), exclude);
  } else if (body?.seedTrackId) {
    const seed = catalog.find((t) => t.id === body.seedTrackId);
    if (!seed) return NextResponse.json({ error: "Parça yok" }, { status: 404 });
    const slugs = seed.terms.map((t) => t.term.slug);
    profile = {
      venueFit: slugs.find((s) => ["cafe", "restaurant", "hotel", "spa", "retail", "gym", "office", "lounge"].includes(s)),
      mood: slugs.find((s) => ["calm", "warm", "elegant", "focused", "uplifting", "intimate", "spacious"].includes(s)),
      energyMin: Math.max(1, seed.energy - 1),
      energyMax: Math.min(5, seed.energy + 1),
      bpmMin: Math.max(40, (seed.bpm ?? 80) - 20),
      bpmMax: Math.min(180, (seed.bpm ?? 80) + 20),
      termSlugs: slugs,
      excludeIds: [...exclude, seed.id],
    };
  } else {
    return NextResponse.json({ error: "stationId veya seedTrackId gerekli" }, { status: 400 });
  }

  const radioTracks: RadioTrack[] = catalog.map(toRadioTrack);
  const picked = pickRadioQueue(radioTracks, profile, body?.count ?? 8);
  const include = await publishedTrackInclude();
  const full = await prisma.track.findMany({
    where: { id: { in: picked.map((p) => p.id) } },
    include,
  });
  const ordered = picked
    .map((p) => full.find((t) => t.id === p.id))
    .filter(Boolean)
    .map((t) => toPlayer(t!));
  return NextResponse.json({
    station: station ? { id: station.id, name: station.name, crossfadeSec: station.crossfadeSec, feedId: station.feedId } : null,
    tracks: ordered,
  });
}
