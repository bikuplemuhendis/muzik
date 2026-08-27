export type PlayLike = {
  source: string;
  stationId: string;
  createdAt: Date | string;
  trackTitle?: string;
};

export function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item) || "—";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function playsByHour(items: PlayLike[]) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  for (const item of items) {
    const date = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    buckets[date.getHours()].count += 1;
  }
  return buckets;
}

export function playsBySource(items: PlayLike[]) {
  return countBy(items, (i) => i.source || "player");
}

export function playsByStation(items: PlayLike[]) {
  return countBy(items, (i) => i.stationId);
}
