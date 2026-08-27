"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StationFormState = {
  name: string;
  slug: string;
  tagline: string;
  coverUrl: string;
  venueFit: string;
  mood: string;
  energyMin: number;
  energyMax: number;
  bpmMin: number;
  bpmMax: number;
  termSlugs: string;
  autoDaypart: boolean;
  crossfadeSec: number;
  isPublished: boolean;
  sortOrder: number;
  feedId: string;
  seedPlaylistId: string;
};

const defaults: StationFormState = {
  name: "",
  slug: "",
  tagline: "",
  coverUrl: "/media/playlists/pl_kahve_saati.png",
  venueFit: "cafe",
  mood: "warm",
  energyMin: 1,
  energyMax: 3,
  bpmMin: 60,
  bpmMax: 100,
  termSlugs: "cafe,conversation-friendly",
  autoDaypart: true,
  crossfadeSec: 4,
  isPublished: true,
  sortOrder: 9,
  feedId: "",
  seedPlaylistId: "",
};

export function StationForm({
  initial,
}: {
  initial?: Partial<StationFormState> & { id?: string };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<StationFormState>({ ...defaults, ...initial });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      termSlugs: form.termSlugs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await fetch(initial?.id ? `/api/admin/stations/${initial.id}` : "/api/admin/stations", {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Kayıt başarısız");
      return;
    }
    router.push("/admin/stations");
    router.refresh();
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm("Bu radyoyu silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/stations/${initial.id}`, { method: "DELETE" });
    router.push("/admin/stations");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      {(
        [
          ["name", "Ad"],
          ["slug", "Slug"],
          ["tagline", "Slogan"],
          ["coverUrl", "Kapak URL"],
          ["venueFit", "Mekân (cafe|all|...)"],
          ["mood", "Ruh hali"],
          ["termSlugs", "Etiketler (virgül)"],
          ["feedId", "Video feed id"],
          ["seedPlaylistId", "Tohum liste id"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          {label}
          <input
            className="mt-1 w-full px-3 py-2"
            value={form[key] as string}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required={key === "name" || key === "slug" || key === "tagline"}
          />
        </label>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Enerji min
          <input type="number" className="mt-1 w-full px-3 py-2" value={form.energyMin} onChange={(e) => setForm({ ...form, energyMin: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          Enerji max
          <input type="number" className="mt-1 w-full px-3 py-2" value={form.energyMax} onChange={(e) => setForm({ ...form, energyMax: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          BPM min
          <input type="number" className="mt-1 w-full px-3 py-2" value={form.bpmMin} onChange={(e) => setForm({ ...form, bpmMin: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          BPM max
          <input type="number" className="mt-1 w-full px-3 py-2" value={form.bpmMax} onChange={(e) => setForm({ ...form, bpmMax: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          Crossfade (sn)
          <input type="number" className="mt-1 w-full px-3 py-2" value={form.crossfadeSec} onChange={(e) => setForm({ ...form, crossfadeSec: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          Sıra
          <input type="number" className="mt-1 w-full px-3 py-2" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.autoDaypart} onChange={(e) => setForm({ ...form, autoDaypart: e.target.checked })} />
        Gün dilimine göre kay
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
        Yayında
      </label>
      {error ? <p className="text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button disabled={busy} className="rounded-full bg-white px-6 py-2 font-semibold text-black">
          {initial?.id ? "Kaydet" : "Oluştur"}
        </button>
        {initial?.id ? (
          <button type="button" onClick={() => void remove()} className="text-sm text-red-400">
            Sil
          </button>
        ) : null}
      </div>
    </form>
  );
}
