export type PlayerTrack = {
  id: string;
  title: string;
  artistName: string;
  collectionName: string;
  audioUrl: string;
  coverUrl: string;
  videoUrl?: string | null;
  durationSec: number;
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
  };
}
