import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  venueName: z.string().min(2),
  venueType: z.string().min(2),
  city: z.string().min(2),
});

export const trackSchema = z.object({
  title: z.string().min(1),
  artistName: z.string().min(1),
  collectionName: z.string().min(1),
  description: z.string().min(1),
  durationSec: z.coerce.number().int().positive(),
  bpm: z.coerce.number().int().min(40).max(200).optional().nullable(),
  energy: z.coerce.number().int().min(1).max(5),
  audioUrl: z.string().min(1),
  coverUrl: z.string().min(1),
  videoUrl: z.string().optional().nullable(),
  isPublished: z.union([z.boolean(), z.string()]).transform((v) => v === true || v === "true" || v === "on"),
  licenseId: z.string().min(1),
  termSlugs: z.array(z.string()).default([]),
  extraMedia: z
    .array(
      z.object({
        url: z.string(),
        kind: z.string(),
        caption: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export const playlistSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  coverUrl: z.string().min(1),
  venueFit: z.string().optional().default(""),
  isPublic: z.union([z.boolean(), z.string()]).transform((v) => v === true || v === "true" || v === "on"),
  isSmart: z.union([z.boolean(), z.string()]).optional().transform((v) => v === true || v === "true" || v === "on"),
  trackIds: z.array(z.string()).default([]),
  rules: z
    .object({
      termSlugs: z.array(z.string()).optional(),
      venueFit: z.string().optional(),
      energyMin: z.number().optional(),
      energyMax: z.number().optional(),
      bpmMin: z.number().optional(),
      bpmMax: z.number().optional(),
    })
    .optional(),
});

export const stationSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string().min(1),
  coverUrl: z.string().min(1),
  venueFit: z.string().default(""),
  mood: z.string().default(""),
  energyMin: z.coerce.number().int().min(1).max(5),
  energyMax: z.coerce.number().int().min(1).max(5),
  bpmMin: z.coerce.number().int(),
  bpmMax: z.coerce.number().int(),
  termSlugs: z.array(z.string()).default([]),
  seedPlaylistId: z.string().optional().default(""),
  feedId: z.string().optional().default(""),
  autoDaypart: z.boolean().default(false),
  crossfadeSec: z.coerce.number().int().min(0).max(12).default(4),
  isPublished: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const feedItemSchema = z.object({
  url: z.string().min(1),
  posterUrl: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  durationSec: z.coerce.number().int().optional().default(8),
});

export const feedSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  coverUrl: z.string().min(1),
  venueFit: z.string().default(""),
  kind: z.string().default("ambient"),
  isPublished: z.boolean().default(true),
  items: z.array(feedItemSchema).default([]),
});

export const zoneSchema = z.object({
  venueId: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["audio", "video", "both"]).default("both"),
  stationId: z.string().optional().default(""),
  playlistId: z.string().optional().default(""),
  feedId: z.string().optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

export const assistSchema = z.object({
  title: z.string().optional(),
  filename: z.string().optional(),
  notes: z.string().optional(),
  durationSec: z.number().optional(),
  trackId: z.string().optional(),
});
