export type PlayerTrack = {
  id: string;
  title: string;
  artistName: string;
  collectionName: string;
  audioUrl: string;
  coverUrl: string;
  videoUrl?: string | null;
  durationSec: number;
  energy?: number;
  bpm?: number | null;
  termSlugs?: string[];
};

export function toPlayerTrack(t: PlayerTrack): PlayerTrack {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artistName,
    collectionName: t.collectionName,
    audioUrl: t.audioUrl,
    coverUrl: t.coverUrl,
    videoUrl: t.videoUrl ?? null,
    durationSec: t.durationSec,
    energy: t.energy,
    bpm: t.bpm,
    termSlugs: t.termSlugs,
  };
}

export function withTerms<T extends { terms?: { term: { slug: string } }[] }>(t: T & PlayerTrack): PlayerTrack {
  return toPlayerTrack({
    ...t,
    termSlugs: t.termSlugs ?? t.terms?.map((x) => x.term.slug),
  });
}
