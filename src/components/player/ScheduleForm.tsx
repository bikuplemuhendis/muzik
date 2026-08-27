"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const slots = [
  { key: "morning", label: "Sabah" },
  { key: "afternoon", label: "Öğleden sonra" },
  { key: "evening", label: "Akşam" },
  { key: "night", label: "Gece" },
];

export function ScheduleForm({
  maxLocations,
  locationCount,
  scheduleJson,
}: {
  venueId: string;
  maxLocations: number;
  locationCount: number;
  scheduleJson: string;
}) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(scheduleJson) as Record<string, string>;
    } catch {
      return {};
    }
  });
  const [locations, setLocations] = useState(locationCount);
  const [msg, setMsg] = useState("");

  async function save() {
    const res = await fetch("/api/venue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleJson: JSON.stringify(schedule), locationCount: locations }),
    });
    setMsg(res.ok ? "Kaydedildi" : "Kayıt başarısız");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 p-5">
      <h2 className="mb-3 font-semibold">Gün dilimi programı</h2>
      <p className="mb-4 text-sm text-[#b3b3b3]">Çalar, saate göre bu liste kimliklerini önerir (ör. pl_kahve_saati).</p>
      <div className="space-y-3">
        {slots.map((s) => (
          <label key={s.key} className="block text-sm">
            {s.label}
            <input
              className="mt-1 w-full px-3 py-2"
              value={schedule[s.key] ?? ""}
              onChange={(e) => setSchedule({ ...schedule, [s.key]: e.target.value })}
            />
          </label>
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
