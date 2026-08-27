"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlayer } from "./PlayerProvider";

export function VenueOps({
  stations,
  feeds,
  activeStationId,
  activeFeedId,
  displayMessage,
  accentColor,
  zones,
}: {
  stations: { id: string; name: string }[];
  feeds: { id: string; name: string }[];
  activeStationId: string;
  activeFeedId: string;
  displayMessage: string;
  accentColor: string;
  zones: { id: string; name: string; kind: string; stationId: string; feedId: string }[];
}) {
  const router = useRouter();
  const { startStation } = usePlayer();
  const [stationId, setStationId] = useState(activeStationId);
  const [feedId, setFeedId] = useState(activeFeedId);
  const [message, setMessage] = useState(displayMessage);
  const [accent, setAccent] = useState(accentColor);
  const [msg, setMsg] = useState("");
  const [zoneState, setZoneState] = useState(zones);

  async function save() {
    const res = await fetch("/api/venue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activeStationId: stationId,
        activeFeedId: feedId,
        displayMessage: message,
        accentColor: accent,
      }),
    });
    setMsg(res.ok ? "Kaydedildi" : "Kayıt başarısız");
    router.refresh();
  }

  async function saveZone(zone: (typeof zoneState)[number]) {
    await fetch("/api/venue/zones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: zone.id, stationId: zone.stationId, feedId: zone.feedId }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 p-5">
      <h2 className="mb-3 font-semibold">Yayın ve ekran</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void startStation(stationId || "auto")}
          className="rounded-full bg-[#1ed760] px-4 py-2 text-sm font-semibold text-black"
        >
          Varsayılan radyoyu çal
        </button>
        <button
          type="button"
          onClick={() => void startStation("auto")}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold"
        >
          Gün dilimi programı
        </button>
      </div>
      <label className="mb-3 block text-sm">
        Varsayılan radyo
        <select className="mt-1 w-full px-3 py-2" value={stationId} onChange={(e) => setStationId(e.target.value)}>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mb-3 block text-sm">
        Varsayılan video
        <select className="mt-1 w-full px-3 py-2" value={feedId} onChange={(e) => setFeedId(e.target.value)}>
          <option value="">Yok</option>
          {feeds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mb-3 block text-sm">
        TV mesajı
        <input className="mt-1 w-full px-3 py-2" value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label className="mb-3 block text-sm">
        Vurgu rengi
        <input className="mt-1 w-full px-3 py-2" value={accent} onChange={(e) => setAccent(e.target.value)} />
      </label>
      <button type="button" onClick={() => void save()} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
        Yayın ayarını kaydet
      </button>
      {msg ? <p className="mt-2 text-sm text-[#b3b3b3]">{msg}</p> : null}

      {zoneState.length ? (
        <div className="mt-6">
          <h3 className="mb-2 font-semibold">Bölgeler</h3>
          <ul className="space-y-3 text-sm">
            {zoneState.map((z, i) => (
              <li key={z.id} className="rounded-lg bg-[#181818] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span>
                    {z.name} <span className="text-[#6a6a6a]">· {z.kind}</span>
                  </span>
                  <Link href={`/display?zone=${z.id}`} className="text-[#c8a45a]">
                    TV
                  </Link>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <select
                    className="px-2 py-1"
                    value={z.stationId}
                    onChange={(e) => {
                      const next = zoneState.map((row, idx) => (idx === i ? { ...row, stationId: e.target.value } : row));
                      setZoneState(next);
                    }}
                  >
                    <option value="">Radyo yok</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-2 py-1"
                    value={z.feedId}
                    onChange={(e) => {
                      const next = zoneState.map((row, idx) => (idx === i ? { ...row, feedId: e.target.value } : row));
                      setZoneState(next);
                    }}
                  >
                    <option value="">Video yok</option>
                    {feeds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => void saveZone(zoneState[i])} className="mt-2 text-xs text-[#c8a45a]">
                  Bölgeyi kaydet
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
