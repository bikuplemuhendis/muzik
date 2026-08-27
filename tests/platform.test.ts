import { describe, expect, it } from "vitest";
import { localAssist } from "@/lib/ai";
import { TAXONOMY, TRACKS, PLAYLISTS, PLANS, STATIONS, SMART_PLAYLISTS, termsByKind } from "@/data/catalog";
import { matchesSmartRules, pickRadioQueue, pickStationForContext, scoreTrackForRadio } from "@/lib/radio";
import { parseVenueProgram, pickStationIdForVenue, resolveProgram } from "@/lib/schedule";
import { countBy, playsByHour } from "@/lib/analytics";
import { annualDiscountPercent, canAddLocation, formatTry, perLocationMonthly } from "@/lib/pricing";
import { daypartForHour, formatDuration, greetingForHour } from "@/lib/format";
import { signSession, verifySession } from "@/lib/session";

describe("taxonomy", () => {
  it("covers venue, mood, genre, daypart and commercial tags", () => {
    const kinds = new Set(TAXONOMY.map((t) => t.kind));
    expect([...kinds].sort()).toEqual(["DAYPART", "GENRE", "MOOD", "TAG", "VENUE"]);
    expect(termsByKind("VENUE").map((t) => t.slug)).toContain("cafe");
    expect(TAXONOMY.some((t) => t.slug === "royalty-free")).toBe(true);
    expect(TAXONOMY.some((t) => t.slug === "conversation-friendly")).toBe(true);
  });

  it("every seeded track maps to known term slugs", () => {
    const slugs = new Set(TAXONOMY.map((t) => t.slug));
    for (const track of TRACKS) {
      expect(track.termSlugs.length).toBeGreaterThan(3);
      for (const slug of track.termSlugs) {
        expect(slugs.has(slug), `${track.title} unknown slug ${slug}`).toBe(true);
      }
    }
  });

  it("playlists only reference existing tracks", () => {
    const ids = new Set(TRACKS.map((t) => t.id));
    for (const pl of PLAYLISTS) {
      expect(pl.trackIds.length).toBeGreaterThan(0);
      for (const id of pl.trackIds) expect(ids.has(id)).toBe(true);
    }
  });
});

describe("pricing", () => {
  it("keeps business plans below typical collecting-society venue guesswork and has annual discount", () => {
    const cafe = PLANS.find((p) => p.slug === "kafe")!;
    const chain = PLANS.find((p) => p.slug === "zincir")!;
    expect(cafe.monthlyPriceTry).toBeGreaterThan(0);
    expect(cafe.monthlyPriceTry).toBeLessThan(chain.monthlyPriceTry);
    expect(annualDiscountPercent(cafe)).toBeGreaterThanOrEqual(15);
    expect(formatTry(1490)).toContain("1.490");
    expect(perLocationMonthly(chain)).toBeLessThan(chain.monthlyPriceTry);
    expect(canAddLocation(1, 1)).toBe(false);
    expect(canAddLocation(2, 3)).toBe(true);
  });
});

describe("aura intelligence", () => {
  it("tags a spa filename as calm ambient wellness", () => {
    const result = localAssist({ filename: "warm-stone-spa.mp3", notes: "masaj odası" });
    expect(result.termSlugs).toContain("spa");
    expect(result.termSlugs).toContain("calm");
    expect(result.energy).toBe(1);
    expect(result.description.toLowerCase()).toContain("telifsiz");
    expect(result.mode).toBe("local");
  });

  it("titles untitled spa notes instead of leaving Adsız parça", () => {
    const result = localAssist({ notes: "spa masaj odası" });
    expect(result.title.toLowerCase()).toContain("spa");
    expect(result.termSlugs).toContain("spa");
  });

  it("tags cafe morning copy", () => {
    const result = localAssist({ title: "Kahve sabahı", notes: "cafe brunch" });
    expect(result.venueFits).toContain("cafe");
    expect(result.termSlugs).toContain("conversation-friendly");
  });
});

describe("session", () => {
  it("signs and verifies admin cookies", () => {
    const token = signSession({ userId: "user_admin", role: "ADMIN" });
    const session = verifySession(token);
    expect(session?.userId).toBe("user_admin");
    expect(session?.role).toBe("ADMIN");
    expect(verifySession("tampered.token")).toBeNull();
  });
});

describe("radio", () => {
  const spa = { id: "a", energy: 1, bpm: 52, termSlugs: ["spa", "calm", "ambient"] };
  const retail = { id: "b", energy: 4, bpm: 110, termSlugs: ["retail", "uplifting"] };
  const profile = {
    venueFit: "spa",
    mood: "calm",
    energyMin: 1,
    energyMax: 1,
    bpmMin: 40,
    bpmMax: 70,
    termSlugs: ["spa", "ambient"],
  };

  it("scores spa tracks above retail for a spa station", () => {
    expect(scoreTrackForRadio(spa, profile)).toBeGreaterThan(scoreTrackForRadio(retail, profile));
  });

  it("never returns excluded ids in a radio queue", () => {
    const queue = pickRadioQueue([spa, retail], { ...profile, excludeIds: ["a"] }, 5, () => 0);
    expect(queue.map((t) => t.id)).not.toContain("a");
  });

  it("picks auto daypart station for evening hotel", () => {
    const chosen = pickStationForContext(
      STATIONS.map((s) => ({
        id: s.id,
        venueFit: s.venueFit,
        autoDaypart: s.autoDaypart,
        termSlugs: s.termSlugs,
        sortOrder: s.sortOrder,
      })),
      19,
      "hotel",
    );
    expect(chosen?.id).toBeTruthy();
    expect(["hotel", "all"]).toContain(chosen?.venueFit);
  });

  it("smart playlist rules keep conversation-friendly low energy", () => {
    const rules = SMART_PLAYLISTS[0].rules;
    expect(matchesSmartRules({ id: "x", energy: 2, bpm: 70, termSlugs: ["conversation-friendly", "cafe"] }, rules)).toBe(true);
    expect(matchesSmartRules({ id: "y", energy: 4, bpm: 110, termSlugs: ["conversation-friendly"] }, rules)).toBe(false);
  });
});

describe("format", () => {
  it("formats player clock and greetings", () => {
    expect(formatDuration(125)).toBe("2:05");
    expect(greetingForHour(8)).toBe("Günaydın");
    expect(daypartForHour(19)).toBe("evening");
    expect(daypartForHour(2)).toBe("night");
  });
});

describe("venue program", () => {
  it("reads legacy playlist ids and new slot objects", () => {
    const legacy = parseVenueProgram(JSON.stringify({ morning: "pl_kahve_saati", evening: "st_service" }));
    expect(legacy.morning.playlistId).toBe("pl_kahve_saati");
    expect(legacy.evening.stationId).toBe("st_service");
    const modern = parseVenueProgram(
      JSON.stringify({
        morning: { stationId: "st_cafe_fm", playlistId: "pl_kahve_saati", feedId: "feed_cafe" },
      }),
    );
    expect(modern.morning.feedId).toBe("feed_cafe");
  });

  it("resolves evening slot and prefers scheduled station", () => {
    const json = JSON.stringify({
      evening: { stationId: "st_service", playlistId: "pl_aksam_servisi", feedId: "feed_dining" },
    });
    expect(resolveProgram(json, 19).stationId).toBe("st_service");
    const id = pickStationIdForVenue({
      scheduleJson: json,
      activeStationId: "st_cafe_fm",
      venueType: "cafe",
      hour: 19,
      stations: STATIONS.map((s) => ({
        id: s.id,
        venueFit: s.venueFit,
        autoDaypart: s.autoDaypart,
        termSlugs: s.termSlugs,
        sortOrder: s.sortOrder,
      })),
    });
    expect(id).toBe("st_service");
  });
});

describe("analytics", () => {
  it("buckets plays by hour and counts sources", () => {
    const items = [
      { source: "radio", stationId: "st_cafe_fm", createdAt: new Date("2026-08-27T08:15:00"), trackTitle: "A" },
      { source: "radio", stationId: "st_cafe_fm", createdAt: new Date("2026-08-27T08:40:00"), trackTitle: "B" },
      { source: "playlist", stationId: "", createdAt: new Date("2026-08-27T19:10:00"), trackTitle: "A" },
    ];
    expect(playsByHour(items)[8].count).toBe(2);
    expect(playsByHour(items)[19].count).toBe(1);
    expect(countBy(items, (i) => i.trackTitle)[0]).toEqual(["A", 2]);
  });
});

