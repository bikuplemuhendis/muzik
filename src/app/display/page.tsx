import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DisplayScreen } from "@/components/player/DisplayScreen";
import { pickFeedIdForVenue, pickStationIdForVenue } from "@/lib/schedule";

export default async function DisplayPage({
  searchParams,
}: {
  searchParams: Promise<{ feed?: string; station?: string; zone?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/display");
  const q = await searchParams;
  const venue = user.venue;
  const hour = new Date().getHours();
  const stations = await prisma.radioStation.findMany({ where: { isPublished: true } });
  let zone = null;
  if (q.zone) {
    zone = await prisma.zone.findUnique({ where: { id: q.zone } });
  } else if (venue) {
    zone = await prisma.zone.findFirst({ where: { venueId: venue.id, isDefault: true } });
  }
  const scheduledStation = venue
    ? pickStationIdForVenue({
        scheduleJson: venue.scheduleJson,
        activeStationId: venue.activeStationId,
        venueType: venue.venueType,
        hour,
        stations: stations.map((s) => ({
          id: s.id,
          venueFit: s.venueFit,
          autoDaypart: s.autoDaypart,
          termSlugs: JSON.parse(s.termSlugsJson || "[]") as string[],
          sortOrder: s.sortOrder,
        })),
      })
    : "";
  const scheduledFeed = venue ? pickFeedIdForVenue({ scheduleJson: venue.scheduleJson, activeFeedId: venue.activeFeedId, hour }) : "";
  const stationId = q.station || (q.zone ? zone?.stationId : "") || scheduledStation || zone?.stationId || venue?.activeStationId || "st_cafe_fm";
  const feedId = q.feed || (q.zone ? zone?.feedId : "") || scheduledFeed || zone?.feedId || venue?.activeFeedId || "";
  const [station, feed] = await Promise.all([
    prisma.radioStation.findUnique({ where: { id: stationId } }),
    feedId ? prisma.videoFeed.findUnique({ where: { id: feedId }, include: { items: { orderBy: { sortOrder: "asc" } } } }) : null,
  ]);
  return (
    <DisplayScreen
      stationId={station?.id ?? stationId}
      stationName={station?.name ?? "Aura Auto"}
      venueName={venue?.name ?? "Aura"}
      message={venue?.displayMessage || "Telifsiz ticari ambiyans"}
      accent={venue?.accentColor || "#c8a45a"}
      videos={(feed?.items ?? []).map((i) => ({ url: i.url, poster: i.posterUrl, caption: i.caption }))}
    />
  );
}
