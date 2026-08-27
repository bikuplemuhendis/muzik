import { prisma } from "./db";
import { daypartForHour } from "./format";
import { matchesSmartRules, type RadioTrack } from "./radio";

export async function publishedTrackInclude() {
  return {
    terms: { include: { term: true } },
    media: { orderBy: { sortOrder: "asc" as const } },
    license: true,
  };
}

export function toRadioTrack(track: { id: string; energy: number; bpm: number | null; terms: { term: { slug: string } }[] }): RadioTrack {
  return {
    id: track.id,
    energy: track.energy,
    bpm: track.bpm,
    termSlugs: track.terms.map((t) => t.term.slug),
  };
}

export async function getPublishedRadioCatalog() {
  const include = await publishedTrackInclude();
  const tracks = await prisma.track.findMany({ where: { isPublished: true }, include });
  return tracks;
}

export async function getHomeCatalog() {
  const include = await publishedTrackInclude();
  const [playlists, recent, terms, stations, feeds, collections] = await Promise.all([
    prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        tracks: {
          orderBy: { position: "asc" },
          include: { track: { include } },
        },
      },
    }),
    prisma.track.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      include,
    }),
    prisma.taxonomyTerm.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] }),
    prisma.radioStation.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.videoFeed.findMany({
      where: { isPublished: true },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.collection.findMany(),
  ]);
  return { playlists, recent, terms, stations, feeds, collections };
}

export async function getPlaylist(id: string) {
  const include = await publishedTrackInclude();
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      tracks: {
        orderBy: { position: "asc" },
        include: { track: { include } },
      },
    },
  });
  if (!playlist) return null;
  if (playlist.isSmart) {
    const rules = JSON.parse(playlist.rulesJson || "{}") as {
      termSlugs?: string[];
      venueFit?: string;
      energyMin?: number;
      energyMax?: number;
      bpmMin?: number;
      bpmMax?: number;
    };
    const all = await prisma.track.findMany({ where: { isPublished: true }, include });
    const matched = all.filter((t) => matchesSmartRules(toRadioTrack(t), rules));
    return {
      ...playlist,
      tracks: matched.map((track, position) => ({
        playlistId: playlist.id,
        trackId: track.id,
        position,
        track,
      })),
    };
  }
  return playlist;
}

export async function getTrack(id: string) {
  const include = await publishedTrackInclude();
  return prisma.track.findUnique({
    where: { id },
    include: {
      ...include,
      playlistTracks: { include: { playlist: true } },
    },
  });
}

export async function searchCatalog(q: string) {
  const include = await publishedTrackInclude();
  const query = q.trim();
  if (!query) {
    return { tracks: [], playlists: [], terms: [], stations: [], feeds: [] };
  }
  const [tracks, playlists, terms, stations, feeds] = await Promise.all([
    prisma.track.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query } },
          { artistName: { contains: query } },
          { collectionName: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include,
      take: 40,
    }),
    prisma.playlist.findMany({
      where: {
        isPublic: true,
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
      },
      take: 12,
    }),
    prisma.taxonomyTerm.findMany({
      where: {
        OR: [{ name: { contains: query } }, { nameTr: { contains: query } }, { slug: { contains: query } }],
      },
    }),
    prisma.radioStation.findMany({
      where: {
        isPublished: true,
        OR: [{ name: { contains: query } }, { tagline: { contains: query } }, { venueFit: { contains: query } }],
      },
    }),
    prisma.videoFeed.findMany({
      where: {
        isPublished: true,
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
    }),
  ]);
  return { tracks, playlists, terms, stations, feeds };
}

export async function browseByTerm(kind: string, slug: string) {
  const include = await publishedTrackInclude();
  const term = await prisma.taxonomyTerm.findUnique({
    where: { kind_slug: { kind: kind.toUpperCase(), slug } },
  });
  if (!term) return null;
  const links = await prisma.trackTerm.findMany({
    where: { termId: term.id, track: { isPublished: true } },
    include: { track: { include } },
  });
  const playlists =
    term.kind === "VENUE"
      ? await prisma.playlist.findMany({
          where: { isPublic: true, venueFit: term.slug },
          include: {
            tracks: {
              orderBy: { position: "asc" },
              include: { track: { include } },
            },
          },
        })
      : [];
  return { term, tracks: links.map((l) => l.track), playlists };
}

export async function daypartPlaylist(hour = new Date().getHours()) {
  const slug = daypartForHour(hour);
  const include = await publishedTrackInclude();
  const term = await prisma.taxonomyTerm.findUnique({
    where: { kind_slug: { kind: "DAYPART", slug } },
  });
  if (!term) return { slug, tracks: [] };
  const links = await prisma.trackTerm.findMany({
    where: { termId: term.id, track: { isPublished: true } },
    include: { track: { include } },
    take: 20,
  });
  return { slug, tracks: links.map((l) => l.track) };
}
