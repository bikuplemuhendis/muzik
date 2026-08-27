import { daypartForHour } from "./format";

export type RadioTrack = {
  id: string;
  energy: number;
  bpm: number | null;
  termSlugs: string[];
};

export type RadioProfile = {
  venueFit?: string;
  mood?: string;
  energyMin: number;
  energyMax: number;
  bpmMin: number;
  bpmMax: number;
  termSlugs: string[];
  excludeIds?: string[];
};

export type StationLike = {
  id: string;
  venueFit: string;
  autoDaypart: boolean;
  termSlugs: string[];
  sortOrder: number;
};

export function scoreTrackForRadio(track: RadioTrack, profile: RadioProfile) {
  if (profile.excludeIds?.includes(track.id)) return -1000;
  let score = 0;
  const midEnergy = (profile.energyMin + profile.energyMax) / 2;
  if (track.energy >= profile.energyMin && track.energy <= profile.energyMax) score += 5;
  else score -= Math.abs(track.energy - midEnergy) * 2;

  if (track.bpm != null) {
    if (track.bpm >= profile.bpmMin && track.bpm <= profile.bpmMax) score += 2;
    else score -= 1;
  }

  const overlap = track.termSlugs.filter((s) => profile.termSlugs.includes(s)).length;
  score += overlap * 3;
  if (profile.venueFit && track.termSlugs.includes(profile.venueFit)) score += 6;
  if (profile.mood && track.termSlugs.includes(profile.mood)) score += 4;
  if (track.termSlugs.includes("conversation-friendly")) score += 1;
  return score;
}

export function rankRadioTracks(tracks: RadioTrack[], profile: RadioProfile) {
  return [...tracks]
    .map((t) => ({ track: t, score: scoreTrackForRadio(t, profile) }))
    .filter((x) => x.score > -500)
    .sort((a, b) => b.score - a.score);
}

export function pickRadioQueue(tracks: RadioTrack[], profile: RadioProfile, count: number, rng: () => number = Math.random) {
  const ranked = rankRadioTracks(tracks, profile);
  const picked: RadioTrack[] = [];
  const used = new Set(profile.excludeIds ?? []);
  while (picked.length < count && ranked.length) {
    const candidates = ranked.filter((r) => !used.has(r.track.id)).slice(0, Math.max(3, Math.min(6, ranked.length)));
    if (!candidates.length) break;
    const choice = candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))];
    picked.push(choice.track);
    used.add(choice.track.id);
  }
  return picked;
}

export function pickStationForContext(stations: StationLike[], hour: number, venueType?: string) {
  const daypart = daypartForHour(hour);
  const byVenue = venueType ? stations.filter((s) => s.venueFit === venueType || s.venueFit === "all") : stations;
  const pool = byVenue.length ? byVenue : stations;
  const daypartHit = pool.find((s) => s.autoDaypart && s.termSlugs.includes(daypart));
  if (daypartHit) return daypartHit;
  return [...pool].sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;
}

export type SmartRules = {
  termSlugs?: string[];
  venueFit?: string;
  energyMin?: number;
  energyMax?: number;
  bpmMin?: number;
  bpmMax?: number;
};

export function matchesSmartRules(track: RadioTrack, rules: SmartRules) {
  if (rules.venueFit && !track.termSlugs.includes(rules.venueFit)) return false;
  if (rules.energyMin != null && track.energy < rules.energyMin) return false;
  if (rules.energyMax != null && track.energy > rules.energyMax) return false;
  if (rules.bpmMin != null && track.bpm != null && track.bpm < rules.bpmMin) return false;
  if (rules.bpmMax != null && track.bpm != null && track.bpm > rules.bpmMax) return false;
  if (rules.termSlugs?.length) {
    const ok = rules.termSlugs.every((s) => track.termSlugs.includes(s));
    if (!ok) return false;
  }
  return true;
}

export function stationProfile(station: {
  venueFit: string;
  mood: string;
  energyMin: number;
  energyMax: number;
  bpmMin: number;
  bpmMax: number;
  termSlugsJson: string;
  autoDaypart: boolean;
}, hour = new Date().getHours(), extraExclude: string[] = []): RadioProfile {
  const termSlugs = JSON.parse(station.termSlugsJson || "[]") as string[];
  if (station.autoDaypart) {
    const d = daypartForHour(hour);
    if (!termSlugs.includes(d)) termSlugs.push(d);
  }
  return {
    venueFit: station.venueFit === "all" ? undefined : station.venueFit,
    mood: station.mood || undefined,
    energyMin: station.energyMin,
    energyMax: station.energyMax,
    bpmMin: station.bpmMin,
    bpmMax: station.bpmMax,
    termSlugs,
    excludeIds: extraExclude,
  };
}
