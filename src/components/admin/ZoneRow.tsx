"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ZoneRow({
  zone,
  stations,
  feeds,
  playlists,
}: {
  zone: {
    id: string;
    name: string;
    kind: string;
    stationId: string;
    playlistId: string;
    feedId: string;
    isDefault: boolean;
    venue: { name: string };
  };
  stations: { id: string; name: string }[];
  feeds: { id: string; name: string }[];
  playlists: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: zone.name,
    kind: zone.kind,
    stationId: zone.stationId,
    playlistId: zone.playlistId,
    feedId: zone.feedId,
    isDefault: zone.isDefault,
  });
  const [msg, setMsg] = useState("");

  async function save() {
    const res = await fetch(`/api/admin/zones/${zone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? "Kaydedildi" : "Hata");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Bölge silinsin mi?")) return;
    await fetch(`/api/admin/zones/${zone.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-t border-white/10 align-top">
      <td className="py-3">
        <input className="w-32 px-2 py-1 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <p className="mt-1 text-xs text-[#6a6a6a]">{zone.venue.name}</p>
      </td>
      <td>
        <select className="px-2 py-1 text-sm" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="both">Ses + video</option>
          <option value="audio">Ses</option>
          <option value="video">Video</option>
        </select>
      </td>
      <td>
        <select className="px-2 py-1 text-sm" value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })}>
          <option value="">—</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select className="px-2 py-1 text-sm" value={form.playlistId} onChange={(e) => setForm({ ...form, playlistId: e.target.value })}>
          <option value="">—</option>
          {playlists.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select className="px-2 py-1 text-sm" value={form.feedId} onChange={(e) => setForm({ ...form, feedId: e.target.value })}>
          <option value="">—</option>
          {feeds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <label className="text-xs">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> varsayılan
        </label>
      </td>
      <td className="space-x-2 text-right text-sm">
        <Link href={`/display?zone=${zone.id}`} className="text-[#c8a45a]">
          TV
        </Link>
        <button type="button" onClick={() => void save()} className="text-white">
          Kaydet
        </button>
        <button type="button" onClick={() => void remove()} className="text-red-400">
          Sil
        </button>
        {msg ? <span className="block text-xs text-[#6a6a6a]">{msg}</span> : null}
      </td>
    </tr>
  );
}
