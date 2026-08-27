"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Track = { id: string; title: string; artistName: string };

export function PlaylistForm({
  tracks,
  initial,
}: {
  tracks: Track[];
  initial?: { id?: string; title: string; description: string; coverUrl: string; venueFit: string; isPublic: boolean; trackIds: string[] };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    coverUrl: initial?.coverUrl ?? "",
    venueFit: initial?.venueFit ?? "cafe",
    isPublic: initial?.isPublic ?? true,
    trackIds: initial?.trackIds ?? [],
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
    try {
      const url = initial?.id ? `/api/admin/playlists/${initial.id}` : "/api/admin/playlists";
      const res = await fetch(url, {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button disabled={busy} className="rounded-full bg-white px-6 py-2 font-semibold text-black">
        Kaydet
      </button>
    </form>
  );
}
