import { describe, expect, it } from "vitest";
import { localAssist } from "@/lib/ai";
import { TAXONOMY, TRACKS, PLAYLISTS, PLANS, termsByKind } from "@/data/catalog";
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

describe("format", () => {
  it("formats player clock and greetings", () => {
    expect(formatDuration(125)).toBe("2:05");
    expect(greetingForHour(8)).toBe("Günaydın");
    expect(daypartForHour(19)).toBe("evening");
    expect(daypartForHour(2)).toBe("night");
  });
});
