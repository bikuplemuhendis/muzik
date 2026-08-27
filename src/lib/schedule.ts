import { daypartForHour } from "./format";
import { pickStationForContext, type StationLike } from "./radio";

export const DAYPARTS = ["morning", "afternoon", "evening", "night"] as const;
export type Daypart = (typeof DAYPARTS)[number];

export type ProgramSlot = {
  stationId: string;
  playlistId: string;
  feedId: string;
};

export type VenueProgram = Record<Daypart, ProgramSlot>;

export function emptySlot(): ProgramSlot {
  return { stationId: "", playlistId: "", feedId: "" };
}

export function emptyProgram(): VenueProgram {
  return {
    morning: emptySlot(),
    afternoon: emptySlot(),
    evening: emptySlot(),
    night: emptySlot(),
  };
}

function asSlot(value: unknown): ProgramSlot {
  if (!value) return emptySlot();
  if (typeof value === "string") {
    if (value.startsWith("st_")) return { ...emptySlot(), stationId: value };
    if (value.startsWith("feed_")) return { ...emptySlot(), feedId: value };
    return { ...emptySlot(), playlistId: value };
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return {
      stationId: typeof o.stationId === "string" ? o.stationId : "",
      playlistId: typeof o.playlistId === "string" ? o.playlistId : "",
      feedId: typeof o.feedId === "string" ? o.feedId : "",
    };
  }
  return emptySlot();
}

export function parseVenueProgram(json: string): VenueProgram {
  let raw: unknown = {};
  try {
    raw = JSON.parse(json || "{}");
  } catch {
    return emptyProgram();
  }
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const program = emptyProgram();
  for (const key of DAYPARTS) {
    program[key] = asSlot(obj[key]);
  }
  return program;
}

export function resolveProgram(json: string, hour: number): ProgramSlot {
  const program = parseVenueProgram(json);
  return program[daypartForHour(hour)];
}

export function serializeVenueProgram(program: VenueProgram): string {
  return JSON.stringify(program);
}

export function pickStationIdForVenue(opts: {
  scheduleJson: string;
  activeStationId: string;
  venueType?: string;
  hour: number;
  stations: StationLike[];
}): string {
  const published = new Set(opts.stations.map((s) => s.id));
  const slot = resolveProgram(opts.scheduleJson, opts.hour);
  if (slot.stationId && published.has(slot.stationId)) return slot.stationId;
  if (opts.activeStationId && published.has(opts.activeStationId)) return opts.activeStationId;
  return pickStationForContext(opts.stations, opts.hour, opts.venueType)?.id ?? "";
}

export function pickFeedIdForVenue(opts: {
  scheduleJson: string;
  activeFeedId: string;
  hour: number;
}): string {
  const slot = resolveProgram(opts.scheduleJson, opts.hour);
  return slot.feedId || opts.activeFeedId || "";
}
