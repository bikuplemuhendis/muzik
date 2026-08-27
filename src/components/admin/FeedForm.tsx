"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FeedItem = { url: string; posterUrl: string; caption: string };

export function FeedForm({
  initial,
}: {
  initial?: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    coverUrl: string;
    venueFit: string;
    kind: string;
    isPublished: boolean;
    items: FeedItem[];
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    coverUrl: initial?.coverUrl ?? "/media/covers/morning-steam.png",
    venueFit: initial?.venueFit ?? "cafe",
    kind: initial?.kind ?? "ambient",
    isPublished: initial?.isPublished ?? true,
    items: initial?.items?.length ? initial.items : [{ url: "", posterUrl: "", caption: "" }],
  });

  function updateItem(i: number, key: keyof FeedItem, value: string) {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)),
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      items: form.items.filter((i) => i.url.trim()),
    };
    const res = await fetch(initial?.id ? `/api/admin/feeds/${initial.id}` : "/api/admin/feeds", {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Kayıt başarısız");
      return;
    }
    router.push("/admin/feeds");
    router.refresh();
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm("Bu video beslemesini silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/feeds/${initial.id}`, { method: "DELETE" });
    router.push("/admin/feeds");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-3">
      <label className="block text-sm">
        Ad
        <input className="mt-1 w-full px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Slug
        <input className="mt-1 w-full px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Açıklama
        <textarea className="mt-1 w-full px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Kapak URL
        <input className="mt-1 w-full px-3 py-2" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Mekân
          <input className="mt-1 w-full px-3 py-2" value={form.venueFit} onChange={(e) => setForm({ ...form, venueFit: e.target.value })} />
        </label>
        <label className="text-sm">
          Tür
          <input className="mt-1 w-full px-3 py-2" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
        Yayında
      </label>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Klipler</p>
          <button
            type="button"
            className="text-sm text-[#c8a45a]"
            onClick={() => setForm({ ...form, items: [...form.items, { url: "", posterUrl: "", caption: "" }] })}
          >
            Klip ekle
          </button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, i) => (
            <div key={i} className="rounded-lg border border-white/10 p-3">
              <input className="mb-2 w-full px-3 py-2" placeholder="Video URL" value={item.url} onChange={(e) => updateItem(i, "url", e.target.value)} />
              <input className="mb-2 w-full px-3 py-2" placeholder="Poster URL" value={item.posterUrl} onChange={(e) => updateItem(i, "posterUrl", e.target.value)} />
              <input className="w-full px-3 py-2" placeholder="Başlık" value={item.caption} onChange={(e) => updateItem(i, "caption", e.target.value)} />
            </div>
          ))}
        </div>
      </div>
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
