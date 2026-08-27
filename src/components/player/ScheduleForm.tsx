"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAYPARTS, parseVenueProgram, serializeVenueProgram, type Daypart, type ProgramSlot } from "@/lib/schedule";

const labels: Record<Daypart, string> = {
  morning: "Sabah",
  afternoon: "Öğleden sonra",
  evening: "Akşam",
  night: "Gece",
};

export function ScheduleForm({
  maxLocations,
  locationCount,
  scheduleJson,
  stations,
  playlists,
  feeds,
}: {
  venueId: string;
  maxLocations: number;
  locationCount: number;
  scheduleJson: string;
  stations: { id: string; name: string }[];
  playlists: { id: string; title: string }[];
  feeds: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [schedule, setSchedule] = useState(() => parseVenueProgram(scheduleJson));
  const [locations, setLocations] = useState(locationCount);
  const [msg, setMsg] = useState("");

  function patch(slot: Daypart, key: keyof ProgramSlot, value: string) {
    setSchedule((prev) => ({ ...prev, [slot]: { ...prev[slot], [key]: value } }));
  }

  async function save() {
    const res = await fetch("/api/venue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleJson: serializeVenueProgram(schedule), locationCount: locations }),
    });
    setMsg(res.ok ? "Kaydedildi" : "Kayıt başarısız");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 p-5">
      <h2 className="mb-3 font-semibold">Gün dilimi programı</h2>
      <p className="mb-4 text-sm text-[#b3b3b3]">
        TV ve otomatik radyo bu slota bakar. Saat dilimi değişince yayın kayar.
      </p>
      <div className="space-y-5">
        {DAYPARTS.map((key) => (
          <div key={key} className="rounded-lg bg-[#181818] p-3">
            <p className="mb-2 text-sm font-semibold">{labels[key]}</p>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="text-xs text-[#b3b3b3]">
                Radyo
                <select className="mt-1 w-full px-3 py-2 text-sm text-white" value={schedule[key].stationId} onChange={(e) => patch(key, "stationId", e.target.value)}>
                  <option value="">Varsayılan</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[#b3b3b3]">
                Liste
                <select className="mt-1 w-full px-3 py-2 text-sm text-white" value={schedule[key].playlistId} onChange={(e) => patch(key, "playlistId", e.target.value)}>
                  <option value="">Yok</option>
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[#b3b3b3]">
                Video
                <select className="mt-1 w-full px-3 py-2 text-sm text-white" value={schedule[key].feedId} onChange={(e) => patch(key, "feedId", e.target.value)}>
                  <option value="">Varsayılan</option>
                  {feeds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
        <label className="block text-sm">
          Lokasyon sayısı (azami {maxLocations === 999 ? "sınırsız" : maxLocations})
          <input
            type="number"
            min={1}
            max={maxLocations}
            className="mt-1 w-full px-3 py-2"
            value={locations}
            onChange={(e) => setLocations(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="button" onClick={() => void save()} className="mt-4 rounded-full bg-[#1ed760] px-5 py-2 text-sm font-semibold text-black">
        Programı kaydet
      </button>
      {msg ? <p className="mt-2 text-sm text-[#b3b3b3]">{msg}</p> : null}
    </div>
  );
}
