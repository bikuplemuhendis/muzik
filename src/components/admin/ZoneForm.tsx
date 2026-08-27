"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ZoneForm({
  venues,
  stations,
  playlists,
  feeds,
}: {
  venues: { id: string; name: string }[];
  stations: { id: string; name: string }[];
  playlists: { id: string; title: string }[];
  feeds: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    venueId: venues[0]?.id ?? "",
    name: "",
    kind: "both",
    stationId: "",
    playlistId: "",
    feedId: "",
    isDefault: false,
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError("Kayıt başarısız");
      return;
    }
    setForm({ ...form, name: "", isDefault: false });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mb-8 grid gap-3 rounded-xl bg-[#181818] p-4 md:grid-cols-2">
      <label className="text-sm">
        İşletme
        <select className="mt-1 w-full px-3 py-2" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })}>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Bölge adı
        <input className="mt-1 w-full px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="text-sm">
        Tür
        <select className="mt-1 w-full px-3 py-2" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="both">Ses + video</option>
          <option value="audio">Yalnız ses</option>
          <option value="video">Yalnız video</option>
        </select>
      </label>
      <label className="text-sm">
        Radyo
        <select className="mt-1 w-full px-3 py-2" value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })}>
          <option value="">Yok</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Liste
        <select className="mt-1 w-full px-3 py-2" value={form.playlistId} onChange={(e) => setForm({ ...form, playlistId: e.target.value })}>
          <option value="">Yok</option>
          {playlists.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Video
        <select className="mt-1 w-full px-3 py-2" value={form.feedId} onChange={(e) => setForm({ ...form, feedId: e.target.value })}>
          <option value="">Yok</option>
          {feeds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
        Varsayılan bölge
      </label>
      {error ? <p className="text-sm text-red-400 md:col-span-2">{error}</p> : null}
      <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black md:col-span-2">Bölge ekle</button>
    </form>
  );
}
