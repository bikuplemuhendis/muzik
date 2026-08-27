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
  trackIds: z.array(z.string()).default([]),
});

export const assistSchema = z.object({
  title: z.string().optional(),
  filename: z.string().optional(),
  notes: z.string().optional(),
  durationSec: z.number().optional(),
  trackId: z.string().optional(),
});
