import { mkdirSync, writeFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const TRACKS = [
  { slug: "morning-steam", freq: 196, noise: 0.12, lowpass: 700, from: "0x3d2b1f", to: "0xc48a5a", video: true, photos: 2 },
  { slug: "ceramic-light", freq: 220, noise: 0.08, lowpass: 900, from: "0x2a2420", to: "0xe0c8a0", video: false, photos: 1 },
  { slug: "window-seat", freq: 246, noise: 0.18, lowpass: 1100, from: "0x1c2830", to: "0x8ab0c8", video: false, photos: 1 },
  { slug: "linen-hour", freq: 174, noise: 0.1, lowpass: 650, from: "0x2b1c14", to: "0xc8a45a", video: true, photos: 2 },
  { slug: "slow-service", freq: 233, noise: 0.09, lowpass: 1200, from: "0x1a1210", to: "0xc45a3a", video: false, photos: 1 },
  { slug: "copper-pan", freq: 164, noise: 0.14, lowpass: 800, from: "0x3a2010", to: "0xd08a4a", video: false, photos: 1 },
  { slug: "marble-atrium", freq: 130, noise: 0.16, lowpass: 500, from: "0x101418", to: "0xc8a45a", video: true, photos: 2 },
  { slug: "suite-quiet", freq: 261, noise: 0.06, lowpass: 850, from: "0x121018", to: "0xd0d0d0", video: false, photos: 1 },
  { slug: "concierge-hour", freq: 207, noise: 0.11, lowpass: 1000, from: "0x181410", to: "0x8c5a3c", video: false, photos: 1 },
  { slug: "warm-stone", freq: 98, noise: 0.2, lowpass: 400, from: "0x142018", to: "0x6a8f8a", video: true, photos: 2 },
  { slug: "cedar-steam", freq: 110, noise: 0.22, lowpass: 450, from: "0x201810", to: "0x8a6a4a", video: false, photos: 1 },
  { slug: "still-pool", freq: 87, noise: 0.18, lowpass: 380, from: "0x0e1820", to: "0x8ab4c8", video: false, photos: 1 },
  { slug: "soft-aisle", freq: 293, noise: 0.13, lowpass: 1400, from: "0x1a1428", to: "0x7a6a9a", video: false, photos: 1 },
  { slug: "display-light", freq: 329, noise: 0.1, lowpass: 1800, from: "0x101828", to: "0x4a8aaa", video: true, photos: 2 },
  { slug: "pulse-lane", freq: 146, noise: 0.08, lowpass: 2000, from: "0x201014", to: "0xc45a5a", video: false, photos: 1 },
  { slug: "focus-grid", freq: 185, noise: 0.15, lowpass: 1000, from: "0x101820", to: "0x5a7aa0", video: false, photos: 1 },
  { slug: "amber-glass", freq: 155, noise: 0.12, lowpass: 950, from: "0x140c10", to: "0xc8a45a", video: true, photos: 2 },
  { slug: "low-conversation", freq: 123, noise: 0.14, lowpass: 700, from: "0x0c1018", to: "0x6a4a6a", video: false, photos: 1 },
];

const PLAYLISTS = [
  { id: "pl_kahve_saati", from: "0x3d2b1f", to: "0xc48a5a" },
  { id: "pl_aksam_servisi", from: "0x2b1c14", to: "0xc8a45a" },
  { id: "pl_lobi_sukuneti", from: "0x101418", to: "0xc8a45a" },
  { id: "pl_spa_wellness", from: "0x142018", to: "0x6a8f8a" },
  { id: "pl_butik_magaza", from: "0x1a1428", to: "0x7a6a9a" },
  { id: "pl_ofis_odak", from: "0x101820", to: "0x5a7aa0" },
  { id: "pl_lounge_after_dark", from: "0x140c10", to: "0xc8a45a" },
  { id: "pl_brunch", from: "0xe0c070", to: "0xc48a5a" },
];

function run(args, label) {
  const res = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`${label} failed: ${(res.stderr || res.stdout || "").slice(-1200)}`);
  }
}

function png(out, from, to, size) {
  if (existsSync(out)) return;
  run(
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `color=c=${from}:s=${size}x${size}:d=1`,
      "-vf",
      `geq=r='if(gt(X,Y),${parseInt(from.slice(2, 4), 16)},${parseInt(to.slice(2, 4), 16)})':g='if(gt(X,Y),${parseInt(from.slice(4, 6), 16)},${parseInt(to.slice(4, 6), 16)})':b='if(gt(X,Y),${parseInt(from.slice(6, 8), 16)},${parseInt(to.slice(6, 8), 16)})'`,
      "-frames:v",
      "1",
      out,
    ],
    out,
  );
}

mkdirSync(join(root, "public/media/audio"), { recursive: true });
mkdirSync(join(root, "public/media/covers"), { recursive: true });
mkdirSync(join(root, "public/media/video"), { recursive: true });
mkdirSync(join(root, "public/media/photos"), { recursive: true });
mkdirSync(join(root, "public/media/playlists"), { recursive: true });
mkdirSync(join(root, "public/media/uploads"), { recursive: true });
writeFileSync(join(root, "public/media/uploads/.gitkeep"), "");

for (const t of TRACKS) {
  const audio = join(root, `public/media/audio/${t.slug}.mp3`);
  if (!existsSync(audio)) {
    run(
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        `sine=frequency=${t.freq}:duration=18`,
        "-f",
        "lavfi",
        "-i",
        `sine=frequency=${Math.round(t.freq * 1.5)}:duration=18`,
        "-f",
        "lavfi",
        "-i",
        `anoisesrc=color=pink:amplitude=${t.noise}:duration=18`,
        "-filter_complex",
        `[0]volume=0.35[a];[1]volume=0.18[b];[2]volume=0.45[c];[a][b][c]amix=inputs=3:duration=first,lowpass=f=${t.lowpass},alimiter=limit=0.9,volume=0.85`,
        "-ac",
        "2",
        "-ar",
        "44100",
        "-b:a",
        "128k",
        audio,
      ],
      t.slug,
    );
  }
  png(join(root, `public/media/covers/${t.slug}.png`), t.from, t.to, 640);
  for (let i = 1; i <= t.photos; i++) {
    png(join(root, `public/media/photos/${t.slug}-${i}.png`), t.to, t.from, 720);
  }
  if (t.video) {
    const video = join(root, `public/media/video/${t.slug}.mp4`);
    const cover = join(root, `public/media/covers/${t.slug}.png`);
    if (!existsSync(video)) {
      run(
        [
          "-y",
          "-loop",
          "1",
          "-i",
          cover,
          "-i",
          audio,
          "-vf",
          "scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "32",
          "-c:a",
          "aac",
          "-b:a",
          "96k",
          "-shortest",
          "-t",
          "8",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          video,
        ],
        video,
      );
    }
  }
}

for (const p of PLAYLISTS) {
  png(join(root, `public/media/playlists/${p.id}.png`), p.from, p.to, 640);
}

console.log("Media generated under public/media");
