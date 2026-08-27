"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Track = { id: string; title: string; artistName: string };
type Rules = {
  termSlugs?: string[];
  venueFit?: string;
  energyMin?: number;
  energyMax?: number;
  bpmMin?: number;
  bpmMax?: number;
};

export function PlaylistForm({
  tracks,
  initial,
}: {
  tracks: Track[];
  initial?: {
    id?: string;
    title: string;
    description: string;
    coverUrl: string;
    venueFit: string;
    isPublic: boolean;
    isSmart?: boolean;
    trackIds: string[];
    rules?: Rules;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    coverUrl: initial?.coverUrl ?? "",
    venueFit: initial?.venueFit ?? "cafe",
    isPublic: initial?.isPublic ?? true,
    isSmart: initial?.isSmart ?? false,
    trackIds: initial?.trackIds ?? [],
    termSlugs: (initial?.rules?.termSlugs ?? []).join(", "),
    ruleVenueFit: initial?.rules?.venueFit ?? "",
    energyMin: initial?.rules?.energyMin?.toString() ?? "",
    energyMax: initial?.rules?.energyMax?.toString() ?? "",
    bpmMin: initial?.rules?.bpmMin?.toString() ?? "",
    bpmMax: initial?.rules?.bpmMax?.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setForm((f) => ({
      ...f,
      trackIds: f.trackIds.includes(id) ? f.trackIds.filter((x) => x !== id) : [...f.trackIds, id],
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const rules: Rules = {
      termSlugs: form.termSlugs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      venueFit: form.ruleVenueFit || undefined,
      energyMin: form.energyMin ? Number(form.energyMin) : undefined,
      energyMax: form.energyMax ? Number(form.energyMax) : undefined,
      bpmMin: form.bpmMin ? Number(form.bpmMin) : undefined,
      bpmMax: form.bpmMax ? Number(form.bpmMax) : undefined,
    };
    try {
      const url = initial?.id ? `/api/admin/playlists/${initial.id}` : "/api/admin/playlists";
      const res = await fetch(url, {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          coverUrl: form.coverUrl,
          venueFit: form.venueFit,
          isPublic: form.isPublic,
          isSmart: form.isSmart,
          trackIds: form.isSmart ? [] : form.trackIds,
          rules: form.isSmart ? rules : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Kayıt başarısız");
      router.push("/admin/playlists");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <label className="block text-sm">
        Başlık
        <input className="mt-1 w-full px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Açıklama
        <textarea className="mt-1 w-full px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Kapak URL
        <input className="mt-1 w-full px-3 py-2" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Mekân uyumu
        <input className="mt-1 w-full px-3 py-2" value={form.venueFit} onChange={(e) => setForm({ ...form, venueFit: e.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
        İşletmelere açık
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isSmart} onChange={(e) => setForm({ ...form, isSmart: e.target.checked })} />
        Akıllı kural listesi (katalogdan otomatik dolar)
      </label>
      {form.isSmart ? (
        <div className="space-y-3 rounded-xl border border-white/10 p-4">
          <p className="text-sm font-semibold">Kurallar</p>
          <label className="block text-sm">
            Etiketler (hepsi eşleşmeli)
            <input className="mt-1 w-full px-3 py-2" value={form.termSlugs} onChange={(e) => setForm({ ...form, termSlugs: e.target.value })} />
          </label>
          <label className="block text-sm">
            Mekân etiketi
            <input className="mt-1 w-full px-3 py-2" value={form.ruleVenueFit} onChange={(e) => setForm({ ...form, ruleVenueFit: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Enerji min
              <input className="mt-1 w-full px-3 py-2" value={form.energyMin} onChange={(e) => setForm({ ...form, energyMin: e.target.value })} />
            </label>
            <label className="text-sm">
              Enerji max
              <input className="mt-1 w-full px-3 py-2" value={form.energyMax} onChange={(e) => setForm({ ...form, energyMax: e.target.value })} />
            </label>
            <label className="text-sm">
              BPM min
              <input className="mt-1 w-full px-3 py-2" value={form.bpmMin} onChange={(e) => setForm({ ...form, bpmMin: e.target.value })} />
            </label>
            <label className="text-sm">
              BPM max
              <input className="mt-1 w-full px-3 py-2" value={form.bpmMax} onChange={(e) => setForm({ ...form, bpmMax: e.target.value })} />
            </label>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-sm font-semibold">Parçalar</p>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-white/10">
            {tracks.map((t) => (
              <label key={t.id} className="flex items-center gap-3 border-b border-white/5 px-3 py-2 text-sm">
                <input type="checkbox" checked={form.trackIds.includes(t.id)} onChange={() => toggle(t.id)} />
                <span>
                  {t.title} <span className="text-[#6a6a6a]">· {t.artistName}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button disabled={busy} className="rounded-full bg-white px-6 py-2 font-semibold text-black">
        Kaydet
      </button>
    </form>
  );
}
