import { prisma } from "./db";
import { daypartForHour } from "./format";

export async function publishedTrackInclude() {
  return {
    terms: { include: { term: true } },
    media: { orderBy: { sortOrder: "asc" as const } },
    license: true,
  };
}

export async function getHomeCatalog() {
  const include = await publishedTrackInclude();
  const [playlists, recent, terms] = await Promise.all([
    prisma.playlist.findMany({
      where: { isPublic: true, kind: "CURATED" },
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
  ]);
  return { playlists, recent, terms };
}

export async function getPlaylist(id: string) {
  const include = await publishedTrackInclude();
  return prisma.playlist.findUnique({
    where: { id },
    include: {
      tracks: {
        orderBy: { position: "asc" },
        include: { track: { include } },
      },
    },
  });
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
    return { tracks: [], playlists: [], terms: [] };
  }
  const [tracks, playlists, terms] = await Promise.all([
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
  ]);
  return { tracks, playlists, terms };
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

export type PlayerTrack = {
  id: string;
  title: string;
  artistName: string;
  collectionName: string;
  audioUrl: string;
  coverUrl: string;
  videoUrl: string | null;
  durationSec: number;
};
