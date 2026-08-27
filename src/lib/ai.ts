import { TAXONOMY } from "@/data/catalog";

export type AssistInput = {
  title?: string;
  filename?: string;
  notes?: string;
  durationSec?: number;
};

export type AssistResult = {
  title: string;
  artistName: string;
  collectionName: string;
  description: string;
  bpm: number;
  energy: number;
  termSlugs: string[];
  venueFits: string[];
  daypart: string;
  licenseHint: string;
  mode: "local" | "openai";
};

const KEYWORDS: { pattern: RegExp; slugs: string[]; energy?: number; bpm?: number }[] = [
  { pattern: /spa|wellness|hamam|masaj|thermal|stone|pool|steam/i, slugs: ["spa", "calm", "ambient"], energy: 1, bpm: 52 },
  { pattern: /hotel|lobi|lobby|atrium|suite|concierge/i, slugs: ["hotel", "elegant", "spacious", "ambient"], energy: 2, bpm: 64 },
  { pattern: /cafe|kahve|coffee|brunch|ceramic/i, slugs: ["cafe", "warm", "acoustic", "conversation-friendly"], energy: 2, bpm: 76 },
  { pattern: /restaurant|restoran|dining|linen|service|copper/i, slugs: ["restaurant", "elegant", "acoustic", "conversation-friendly"], energy: 2, bpm: 80 },
  { pattern: /lounge|bar|amber|night|after.?dark|jazz/i, slugs: ["lounge", "intimate", "jazz", "evening"], energy: 3, bpm: 90 },
  { pattern: /retail|magaza|mağaza|aisle|display|butik/i, slugs: ["retail", "uplifting", "electronic"], energy: 3, bpm: 104 },
  { pattern: /gym|spor|pulse|workout/i, slugs: ["gym", "uplifting", "electronic"], energy: 4, bpm: 118 },
  { pattern: /office|ofis|focus|desk|cowork/i, slugs: ["office", "focused", "lofi", "conversation-friendly"], energy: 2, bpm: 86 },
  { pattern: /piano|piyano/i, slugs: ["piano", "neoclassical", "calm"] },
  { pattern: /lo-?fi|lofi/i, slugs: ["lofi"] },
  { pattern: /ambient|pad|drone/i, slugs: ["ambient", "loopable"] },
  { pattern: /morning|sabah/i, slugs: ["morning"] },
  { pattern: /evening|akşam|aksam/i, slugs: ["evening"] },
  { pattern: /night|gece/i, slugs: ["night"] },
];

function titleFromFilename(filename: string) {
  const base = filename.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
  return base
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function localAssist(input: AssistInput): AssistResult {
  const blob = `${input.title ?? ""} ${input.filename ?? ""} ${input.notes ?? ""}`;
  const title = (input.title?.trim() || (input.filename ? titleFromFilename(input.filename) : "Adsız parça")).slice(0, 80);
  const slugs = new Set<string>(["royalty-free", "instrumental"]);
  let energy = 2;
  let bpm = 80;
  for (const rule of KEYWORDS) {
    if (rule.pattern.test(blob)) {
      rule.slugs.forEach((s) => slugs.add(s));
      if (rule.energy) energy = rule.energy;
      if (rule.bpm) bpm = rule.bpm;
    }
  }
  if (input.durationSec && input.durationSec >= 15) slugs.add("loopable");

  const venueFits = TAXONOMY.filter((t) => t.kind === "VENUE" && slugs.has(t.slug)).map((t) => t.slug);
  if (venueFits.length === 0) {
    slugs.add("cafe");
    venueFits.push("cafe");
  }
  const daypart =
    ["morning", "afternoon", "evening", "night"].find((d) => slugs.has(d)) ??
    (energy <= 1 ? "afternoon" : energy >= 4 ? "afternoon" : "evening");
  slugs.add(daypart);

  const venuesTr = TAXONOMY.filter((t) => t.kind === "VENUE" && slugs.has(t.slug))
    .map((t) => t.nameTr)
    .join(", ");

  const description = `${title}, işletme içi ticari icra için yazılmış telifsiz enstrümantal bir parçadır. ${venuesTr} mekânlarında sohbeti ezmeden çalınacak şekilde düşük-orta enerjide tutulmuştur. Söz yoktur; kamuoyuna açık mekânda çalınabilir.`;

  return {
    title,
    artistName: "Aura Atelier",
    collectionName: "Mekan Kütüphanesi",
    description,
    bpm,
    energy,
    termSlugs: [...slugs].filter((s) => TAXONOMY.some((t) => t.slug === s)),
    venueFits,
    daypart,
    licenseHint: "Aura Ticari İcra — Türkiye ve dünya, atıf zorunlu değil, toplama kuruluşu bildirimi işletme belgesi ile.",
    mode: "local",
  };
}

export async function openaiAssist(input: AssistInput): Promise<AssistResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const allowed = TAXONOMY.map((t) => `${t.kind}:${t.slug}`).join(", ");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Aura katalog asistanısın. İşletme ambiyans müziği için JSON üret. Sadece şu slug'ları kullan: " +
            allowed +
            '. Şema: {"title":string,"artistName":string,"collectionName":string,"description":string,"bpm":number,"energy":1-5,"termSlugs":string[]}',
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  const parsed = JSON.parse(content) as Partial<AssistResult>;
  const fallback = localAssist(input);
  return {
    ...fallback,
    ...parsed,
    termSlugs: (parsed.termSlugs ?? fallback.termSlugs).filter((s) => TAXONOMY.some((t) => t.slug === s)),
    mode: "openai",
  };
}

export async function runAssist(input: AssistInput): Promise<AssistResult> {
  try {
    const remote = await openaiAssist(input);
    if (remote) return remote;
  } catch {
    // local fallback
  }
  return localAssist(input);
}
