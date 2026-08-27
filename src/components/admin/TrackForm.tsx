"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload } from "lucide-react";
import { termsGrouped } from "@/data/catalog";

type Term = { slug: string; nameTr: string; kind: string };
type MediaItem = { url: string; kind: string; caption: string };

type Props = {
  licenses: { id: string; name: string }[];
  terms: Term[];
  initial?: {
    id?: string;
    title: string;
    artistName: string;
    collectionName: string;
    description: string;
    durationSec: number;
    bpm: number | null;
    energy: number;
    audioUrl: string;
    coverUrl: string;
    videoUrl: string | null;
    isPublished: boolean;
    licenseId: string;
    termSlugs: string[];
    extraMedia: MediaItem[];
  };
};

const empty = {
  title: "",
  artistName: "Aura Atelier",
  collectionName: "Mekan Kütüphanesi",
  description: "",
  durationSec: 18,
  bpm: 80,
  energy: 2,
  audioUrl: "",
  coverUrl: "",
  videoUrl: "",
  isPublished: true,
  licenseId: "",
  termSlugs: ["royalty-free", "instrumental"] as string[],
  extraMedia: [] as MediaItem[],
};

export function TrackForm({ licenses, initial }: Props) {
  const router = useRouter();
  const grouped = useMemo(() => termsGrouped(), []);
  const [form, setForm] = useState({
    ...empty,
    licenseId: initial?.licenseId || licenses[0]?.id || "",
    ...initial,
    videoUrl: initial?.videoUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [aiMode, setAiMode] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function upload(file: File, kind: "audio" | "image" | "video") {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Yükleme başarısız");
    return json.url as string;
  }

  async function onAudio(file: File) {
    setBusy(true);
    setError("");
    try {
      const url = await upload(file, "audio");
      set("audioUrl", url);
      if (!form.title) set("title", file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function assist() {
    setAiBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          filename: form.audioUrl,
          notes: aiNote || form.description,
          durationSec: form.durationSec,
          trackId: initial?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI başarısız");
      setForm((f) => ({
        ...f,
        title: json.title || f.title,
        artistName: json.artistName || f.artistName,
        collectionName: json.collectionName || f.collectionName,
        description: json.description || f.description,
        bpm: json.bpm || f.bpm,
        energy: json.energy || f.energy,
        termSlugs: json.termSlugs?.length ? json.termSlugs : f.termSlugs,
      }));
      setAiMode(json.mode === "openai" ? "Bulut modeli" : "Yerel Aura Intelligence");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setAiBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        videoUrl: form.videoUrl || null,
        extraMedia: form.extraMedia,
      };
      const url = initial?.id ? `/api/admin/tracks/${initial.id}` : "/api/admin/tracks";
      const res = await fetch(url, {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Kayıt başarısız");
      router.push("/admin/tracks");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  function toggleSlug(slug: string) {
    setForm((f) => ({
      ...f,
      termSlugs: f.termSlugs.includes(slug) ? f.termSlugs.filter((s) => s !== slug) : [...f.termSlugs, slug],
    }));
  }

  return (
    <form onSubmit={save} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          <h2 className="mb-4 text-lg font-semibold">Medya</h2>
          <label className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 p-6 text-sm text-[#b3b3b3] hover:border-[#c8a45a]">
            <Upload className="mb-2 h-6 w-6" />
            Ses dosyası (mp3, wav) — zorunlu
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onAudio(f);
              }}
            />
            {form.audioUrl ? <span className="mt-2 text-[#1ed760]">{form.audioUrl}</span> : null}
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-[#b3b3b3]">
              Kapak fotoğrafı
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setBusy(true);
                  try {
                    set("coverUrl", await upload(f, "image"));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              {form.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverUrl} alt="" className="mt-2 h-28 w-28 rounded object-cover" />
              ) : null}
            </label>
            <label className="text-sm text-[#b3b3b3]">
              Ambiyans videosu (opsiyonel)
              <input
                type="file"
                accept="video/*"
                className="mt-1 block w-full text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setBusy(true);
                  try {
                    set("videoUrl", await upload(f, "video"));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              {form.videoUrl ? <span className="mt-2 block text-[#1ed760]">{form.videoUrl}</span> : null}
            </label>
          </div>
          <label className="mt-4 block text-sm text-[#b3b3b3]">
            Ek fotoğraflar / referans görseller
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full text-xs"
              onChange={async (e) => {
                const files = [...(e.target.files ?? [])];
                setBusy(true);
                try {
                  const uploaded: MediaItem[] = [];
                  for (const file of files) {
                    uploaded.push({ url: await upload(file, "image"), kind: "photo", caption: file.name });
                  }
                  setForm((f) => ({ ...f, extraMedia: [...f.extraMedia, ...uploaded] }));
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {form.extraMedia.map((m) => (
              <div key={m.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="h-16 w-16 rounded object-cover" />
                <button
                  type="button"
                  className="absolute -right-1 -top-1 rounded-full bg-black px-1 text-xs"
                  onClick={() => setForm((f) => ({ ...f, extraMedia: f.extraMedia.filter((x) => x.url !== m.url) }))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          <h2 className="mb-4 text-lg font-semibold">Künye</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Başlık
              <input className="mt-1 w-full px-3 py-2" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </label>
            <label className="text-sm">
              Besteci / proje
              <input className="mt-1 w-full px-3 py-2" value={form.artistName} onChange={(e) => set("artistName", e.target.value)} required />
            </label>
            <label className="text-sm">
              Koleksiyon
              <input className="mt-1 w-full px-3 py-2" value={form.collectionName} onChange={(e) => set("collectionName", e.target.value)} required />
            </label>
            <label className="text-sm">
              Süre (sn)
              <input type="number" className="mt-1 w-full px-3 py-2" value={form.durationSec} onChange={(e) => set("durationSec", Number(e.target.value))} />
            </label>
            <label className="text-sm">
              BPM
              <input type="number" className="mt-1 w-full px-3 py-2" value={form.bpm ?? 80} onChange={(e) => set("bpm", Number(e.target.value))} />
            </label>
            <label className="text-sm">
              Enerji (1-5)
              <input type="number" min={1} max={5} className="mt-1 w-full px-3 py-2" value={form.energy} onChange={(e) => set("energy", Number(e.target.value))} />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            Açıklama
            <textarea className="mt-1 min-h-28 w-full px-3 py-2" value={form.description} onChange={(e) => set("description", e.target.value)} required />
          </label>
          <label className="mt-3 block text-sm">
            Lisans
            <select className="mt-1 w-full px-3 py-2" value={form.licenseId} onChange={(e) => set("licenseId", e.target.value)}>
              {licenses.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
            Yayınla (işletme çalarında görünsün)
          </label>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-[#c8a45a]/40 bg-[#16120a] p-5">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-[#c8a45a]" /> Aura Intelligence
          </h2>
          <p className="mb-3 text-sm text-[#b3b3b3]">
            Başlık, dosya adı ve notlarınızdan mekân, ruh hali, BPM ve ticari açıklama önerir. API anahtarı yoksa yerel model çalışır.
          </p>
          <textarea
            className="mb-3 min-h-20 w-full px-3 py-2 text-sm"
            placeholder="Örn. Kadıköy kafe, sabah, konuşma önde kalsın..."
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
          />
          <button
            type="button"
            onClick={() => void assist()}
            disabled={aiBusy}
            className="w-full rounded-full bg-[#c8a45a] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {aiBusy ? "Analiz ediliyor…" : "Etiket ve metin öner"}
          </button>
          {aiMode ? <p className="mt-2 text-xs text-[#c8a45a]">{aiMode}</p> : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
          <h2 className="mb-4 text-lg font-semibold">Kütüphane etiketleri</h2>
          {grouped.map((g) => (
            <div key={g.kind} className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-[#6a6a6a]">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.terms.map((t) => {
                  const on = form.termSlugs.includes(t.slug);
                  return (
                    <button
                      type="button"
                      key={t.slug}
                      onClick={() => toggleSlug(t.slug)}
                      className={`rounded-full px-3 py-1 text-xs ${on ? "bg-[#c8a45a] text-black" : "bg-[#282828] text-[#b3b3b3]"}`}
                    >
                      {t.nameTr}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !form.audioUrl || !form.coverUrl}
          className="w-full rounded-full bg-white py-3 font-semibold text-black disabled:opacity-40"
        >
          {busy ? "Kaydediliyor…" : initial?.id ? "Güncelle" : "Kataloğa ekle"}
        </button>
      </div>
    </form>
  );
}
